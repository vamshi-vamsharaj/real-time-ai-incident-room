import { GoogleGenerativeAI } from '@google/generative-ai';
import AiResult from './aiResult.model.js';
import Incident from '../incidents/incident.model.js';
import Update from '../updates/update.model.js';

// ── Gemini setup (lazy — only if key exists) ──────────────────────────────
const getGeminiModel = () => {
  const key = process.env.GEMINI_API_KEY;

  if (!key || key === "your_gemini_api_key_here") {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({
      // FIXED: Corrected typo from "gemini-215-flash" to "gemini-2.5-flash"
      model: "gemini-2.5-flash", 
    });
  } catch (err) {
    console.error("Gemini init failed:", err);
    return null;
  }
};

// ── Prompt builder ────────────────────────────────────────────────────────
const buildPrompt = (incident, updates) => {
  const timeline =
    updates.length > 0
      ? updates
          .map(
            (u) =>
              `[${new Date(u.created_at).toISOString()}] ${u.author_name}: ${u.message}`
          )
          .join('\n')
      : 'No updates posted yet.';

  return `
You are an expert incident response coordinator for an enterprise SRE team.
Analyse the following incident and return ONLY a valid JSON object — no markdown, no commentary.

INCIDENT DATA:
Title: ${incident.title}
Priority: ${incident.priority}
Status: ${incident.status}
Reporter: ${incident.reporter_name}
Description: ${incident.description}
Created: ${new Date(incident.created_at).toISOString()}

TIMELINE:
${timeline}

Return this exact JSON structure (all fields required):
{
  "executive_summary": "2-3 sentence overview of what is happening and current status.",
  "current_situation": "Detailed paragraph on the current state, what is known, what is unknown.",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "risk_level": "low|medium|high|critical",
  "recommended_actions": ["Action 1", "Action 2", "Action 3"],
  "resolution_outlook": "Paragraph predicting the resolution path and estimated effort."
}

Rules:
- risk_level must be exactly one of: low, medium, high, critical
- key_findings must have 2-5 items
- recommended_actions must have 2-5 items
- Keep language direct, technical, and actionable
- Do NOT wrap in markdown code blocks
`.trim();
};

// ── Gemini call with timeout ──────────────────────────────────────────────
const callGemini = async (model, prompt) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s hard limit

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps despite instruction
    const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);

    // Validate required shape
    const required = [
      'executive_summary',
      'current_situation',
      'key_findings',
      'risk_level',
      'recommended_actions',
      'resolution_outlook',
    ];
    for (const key of required) {
      if (!parsed[key]) throw new Error(`Missing key: ${key}`);
    }
    const validRisk = ['low', 'medium', 'high', 'critical'];
    if (!validRisk.includes(parsed.risk_level)) {
      parsed.risk_level = mapPriorityToRisk('high');
    }

    // FIXED: Corrected alignment metadata string
    return { data: parsed, provider: 'gemini-2.5-flash' };
  } finally {
    clearTimeout(timeout);
  }
};

// ── Rule-based fallback ───────────────────────────────────────────────────
const mapPriorityToRisk = (priority) => {
  const map = { low: 'low', medium: 'medium', high: 'high', critical: 'critical' };
  return map[priority] || 'high';
};

const buildFallback = (incident, updates) => {
  const updateCount = updates.length;
  const latestUpdate = updates[updates.length - 1];
  const openMins = Math.round(
    (Date.now() - new Date(incident.created_at).getTime()) / 60000
  );

  const statusMap = {
    open: 'has been reported and is awaiting investigation',
    investigating: 'is actively being investigated by the team',
    resolved: 'has been resolved',
  };

  return {
    executive_summary: `"${incident.title}" was reported by ${incident.reporter_name} and ${statusMap[incident.status] || 'is under review'}. Priority is set to ${incident.priority}. The incident has been open for approximately ${openMins} minutes.`,

    current_situation: `The incident was reported as: "${incident.description}". Current status is ${incident.status} with ${incident.priority} priority. ${updateCount > 0 ? `${updateCount} update${updateCount > 1 ? 's' : ''} have been posted to the timeline.` : 'No updates have been posted yet.'} ${latestUpdate ? `The most recent activity: "${latestUpdate.message}" (by ${latestUpdate.author_name}).` : ''}`,

    key_findings: [
      `Incident priority: ${incident.priority}`,
      `Current status: ${incident.status}`,
      `Open duration: ~${openMins} minutes`,
      updateCount > 0
        ? `${updateCount} team update${updateCount > 1 ? 's' : ''} logged`
        : 'No team updates logged yet — immediate attention required',
    ],

    risk_level: mapPriorityToRisk(incident.priority),

    recommended_actions:
      incident.status === 'resolved'
        ? [
            'Conduct a post-incident review within 24 hours',
            'Document root cause and corrective actions',
            'Update runbooks based on learnings',
          ]
        : incident.status === 'investigating'
        ? [
            'Continue active investigation and document findings',
            'Escalate if not resolved within SLA window',
            'Post regular status updates to the timeline',
            'Notify stakeholders of current progress',
          ]
        : [
            'Assign an owner and begin investigation immediately',
            'Post initial findings to the timeline within 15 minutes',
            `Escalate priority if this is impacting ${incident.priority === 'critical' ? 'production' : 'users'}`,
            'Notify relevant stakeholders',
          ],

    resolution_outlook:
      incident.status === 'resolved'
        ? 'This incident has been resolved. Schedule a post-mortem to capture learnings and prevent recurrence.'
        : `Based on the current ${incident.status} status and ${incident.priority} priority, resolution timeline depends on root cause complexity. Continue monitoring and posting updates. Escalate if SLA targets are at risk.`,

    is_fallback: true,
    provider: 'rule-based',
  };
};

// ── Public: generate and persist ─────────────────────────────────────────
/**
 * Fetches incident + updates, calls Gemini (or fallback), saves result.
 * Returns the saved AiResult document as a plain object.
 */
export const generateAndSave = async (incidentId) => {
  // Fetch source data
  const [incident, updates] = await Promise.all([
    Incident.findById(incidentId).lean(),
    Update.find({ incident_id: incidentId }).sort({ created_at: 1 }).lean(),
  ]);

  if (!incident) throw new Error('Incident not found');

  let data;
  let provider;
  let is_fallback;

  const model = getGeminiModel();
  console.log(
    "Runtime Gemini:",
    process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.slice(0, 10)
      : "NOT FOUND"
  );

  if (model) {
    try {
      const prompt = buildPrompt(incident, updates);
      const geminiResult = await callGemini(model, prompt);
      data = geminiResult.data;
      provider = geminiResult.provider;
      is_fallback = false;
    } catch (err) {
      console.error('[AI] Gemini execution failed, falling back:', err);
    }
  }

  if (!data) {
    console.log('[AI] Using rule-based fallback.');
    const fb = buildFallback(incident, updates);
    data = fb;
    provider = fb.provider;
    is_fallback = fb.is_fallback;
  }

  const saved = await AiResult.create({
    incident_id: incidentId,
    executive_summary: data.executive_summary,
    current_situation: data.current_situation,
    key_findings: Array.isArray(data.key_findings) ? data.key_findings : [],
    risk_level: data.risk_level,
    recommended_actions: Array.isArray(data.recommended_actions)
      ? data.recommended_actions
      : [],
    resolution_outlook: data.resolution_outlook,
    is_fallback,
    provider,
  });

  return saved.toObject();
};

/**
 * Returns all AI results for an incident, newest first.
 */
export const getResultsByIncidentId = async (incidentId) => {
  return await AiResult.find({ incident_id: incidentId })
    .sort({ generated_at: -1 })
    .lean();
};