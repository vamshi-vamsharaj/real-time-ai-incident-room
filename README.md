# IncidentRoom 🚨

A real-time AI-powered incident management platform built with React, Node.js, MongoDB, Socket.IO, and Gemini AI.

## Overview

IncidentRoom helps teams manage operational incidents collaboratively in real time.

Users can:

* Create and track incidents
* Post live updates
* Change incident status through a workflow
* Collaborate across multiple browser tabs in real time
* Generate AI-powered incident summaries and recommendations
* Maintain AI analysis history
* Delete incidents with real-time synchronization

The application is designed to simulate a production-grade incident management system inspired by platforms such as Linear, Jira Service Management, PagerDuty, and Statuspage.

---

## Features

### Real-Time Collaboration

* Socket.IO powered live synchronization
* Multi-tab updates without refresh
* Live incident creation
* Live status changes
* Live update feed
* Live dashboard statistics

### Incident Lifecycle Workflow

Status progression:

Open → Investigating → Resolved

Features:

* Interactive status dropdown
* Workflow validation
* Real-time status synchronization
* Dashboard metrics update instantly

### AI Incident Intelligence

Powered by Google Gemini.

Generate:

* Executive summaries
* Risk assessments
* Recommended actions
* Incident outlook

Additional capabilities:

* AI generation history
* Multiple AI analyses per incident
* Automatic fallback strategy

### Incident Updates Timeline

Each incident includes:

* Team updates
* Status changes
* Activity history
* Real-time timeline synchronization

### Dashboard Analytics

Live metrics:

* Total Incidents
* Open
* Investigating
* Resolved

Statistics update automatically across connected clients.

### Incident Management

* Create incidents
* View incident details
* Update status
* Add updates
* Delete incidents
* Real-time synchronization across sessions

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Socket.IO

### AI

* Google Gemini API

---

## Architecture

```text
┌─────────────────────────────────────────────┐
│                 Frontend                    │
│                                             │
│  React • Vite • Tailwind CSS • Socket.IO    │
│                                             │
│  Dashboard                                  │
│  Incident Detail Page                       │
│  Real-Time Activity Timeline                │
│  AI Intelligence Panel                      │
└──────────────────┬──────────────────────────┘
                   │
                   │ REST API + WebSockets
                   ▼
┌─────────────────────────────────────────────┐
│                  Backend                    │
│                                             │
│        Express.js + Socket.IO Server        │
│                                             │
│  Incident Management                        │
│  Status Workflow Engine                     │
│  Real-Time Event Broadcasting               │
│  AI Summary Generation Service              │
└───────────────┬───────────────┬─────────────┘
                │               │
                │               │
                ▼               ▼
┌─────────────────────┐   ┌──────────────────┐
│   MongoDB Atlas     │   │    Gemini AI     │
│                     │   │                  │
│ Incidents           │   │ Executive Summary│
│ Updates             │   │ Risk Assessment  │
│ AI Results          │   │ Recommendations  │
│ Activity History    │   │ Incident Outlook │
└─────────────────────┘   └──────────────────┘
```

### Real-Time Event Flow

```text
User Creates Incident
        │
        ▼
   REST API
        │
        ▼
   MongoDB Save
        │
        ▼
Socket.IO Event
(incident:created)
        │
        ▼
All Connected Clients
Update Instantly
```

### Socket Events

* `incident:created`
* `incident:update`
* `incident:status_changed`
* `incident:deleted`
* `ai:generated`

### AI Processing Flow

```text
Generate AI Summary
        │
        ▼
Collect Incident Data
        │
        ▼
Gemini AI Analysis
        │
        ▼
Store AI Result
        │
        ▼
Broadcast ai:generated
        │
        ▼
Update All Connected Clients
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>

cd real-time-ai-incident-room
```

---

### Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

---

## Running Locally

Backend:

```bash
cd backend

npm run dev
```

Frontend:

```bash
cd frontend

npm run dev
```

Application:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

## Environment Variables

### Backend

```env
PORT=
MONGO_URI=
GEMINI_API_KEY=
CLIENT_URL=
```

### Frontend

```env
VITE_API_URL=
```

---

## Real-Time Events

Socket.IO Events:

```text
incident:created

incident:update

incident:status_changed

incident:deleted

ai:generated
```

---

## Future Improvements

* User authentication
* Role-based permissions
* Incident assignment
* Notifications
* File attachments
* Audit logs
* Team workspaces

---

## Author

Vamshi Shyamala

Portfolio:
https://vamshi-dev.netlify.app/

GitHub:
[https://github.com/vamshi-vamsharaj](https://github.com/vamshi-vamsharaj)
