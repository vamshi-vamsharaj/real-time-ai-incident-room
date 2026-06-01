import mongoose from 'mongoose';

/**
 * Stores each AI analysis generated for an incident.
 * Multiple results per incident are kept (history).
 * Newest first via the compound index.
 */
const aiResultSchema = new mongoose.Schema(
  {
    incident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'incident_id is required'],
      index: true,
    },

    // ── Structured AI output ─────────────────────────────────────────
    executive_summary: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    current_situation: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    key_findings: {
      type: [String],
      default: [],
    },
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    recommended_actions: {
      type: [String],
      default: [],
    },
    resolution_outlook: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // ── Provenance ───────────────────────────────────────────────────
    is_fallback: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: 'rule-based',
    },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: false },
  }
);

// Primary query: "give me all summaries for incident X, newest first"
aiResultSchema.index({ incident_id: 1, generated_at: -1 });

const AiResult = mongoose.model('AiResult', aiResultSchema);

export default AiResult;