# 🎙️ M-O-M.ai (Minutes of Meeting AI)

> **Autonomous AI-Powered Meeting Intelligence, Google Meet Bot & Google Workspace Integration Platform**  
> *Transform live Google Meet calls and pre-recorded audio into structured executive summaries, actionable task trackers with owner assignments, cross-meeting delta analysis, and styled Google Docs.*

---

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Express-5_TypeScript-green?logo=express)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Gemini_3.5_Flash-Vercel_AI_SDK-8E44AD?logo=google)](https://ai.google.dev/)

---

## 📌 Executive Summary & Problem Statement

### The Problem
In modern client-facing engineering and consulting workflows:
- **Admin Overhead**: Teams spend **5 to 10 hours per week** manually taking, editing, and formatting meeting notes.
- **Dropped Action Items**: Critical tasks, commitments, and deadlines mentioned verbally during calls are frequently forgotten or left without clear owners.
- **Loss of Context**: When managing ongoing client accounts, teams struggle to track what changed between consecutive calls, leading to repeated discussions and misalignment.

### The Solution: M-O-M.ai
**M-O-M.ai** is an end-to-end autonomous meeting intelligence ecosystem. It connects a **Python Google Meet Bot**, a **Node.js/Express API Backend**, a **Google Gemini 3.5 Flash AI Engine**, and a **Next.js 16 Dashboard** to automate the entire post-meeting workflow:

1. **Autonomous Attendance & Recording**: The headless Python bot joins scheduled Google Meet meetings, records audio in high fidelity (`.wav`), and streams it to the server.
2. **Multi-Format Audio Upload**: Teams can also upload pre-recorded meetings (`.mp3`, `.wav`, `.m4a`, `.webm`) via a drag-and-drop interface.
3. **AI Speech Transcription**: Verbatim speech-to-text processing using Google Gemini 3.5 Flash.
4. **Cross-Meeting Delta Tracking**: Automatically fetches prior meeting records for the client to detect shifted priorities, updated requirements, and project progress.
5. **14-Category Schema Analysis**: Extracts structured insights (Summaries, Pain Points, Decision Makers, Action Items with Owners & Deadlines, Commitments, Risks) verified by strict Zod schema validation.
6. **Google Workspace Sync**: Formats and exports clean, styled reports directly into Google Docs within the user's Google Drive.

---

## 🎯 Target Audience & Industry Use Cases ("Uses")

| Industry / Role | Key Use Case & Value Delivered |
| :--- | :--- |
| **Software Agencies & Dev Shops** | Tracks technical requirements, client preferences, scope changes, and team promises across multi-week development sprints. |
| **Product Managers & Owners** | Instantly extracts user pain points, feature requests, decision-maker approvals, and actionable task lists with explicit deadlines. |
| **Sales & Account Managers** | Maintains an accurate record of client commitments, pain points, budget/timeline constraints, and stakeholder roles for seamless handoffs. |
| **Consultants & Freelancers** | Eliminates manual report writing by generating professional, executive-ready Google Docs immediately after call completion. |

---

## 🌟 Core System Capabilities

### 🤖 1. Headless Python Google Meet Bot (`Google-Meet-Bot`)
- **Automated Authentication & Joining**: Authenticates via Gmail, navigates to Google Meet links, automatically turns off microphone/camera before entry, and joins meetings as an attendee.
- **Audio Capture Engine**: Captures full-session audio natively to `.wav` files.
- **Polling Worker Protocol**: Runs continuously in background runner mode (`python -m google_meet_bot.runner`), polling the Express server for queued jobs using a secure `x-bot-token`.
- **Standalone CLI & Python Library**: Can also be executed independently via CLI (`google-meet-bot --meet-link ...`) or imported as a Python package.

### 🧠 2. Gemini 3.5 Flash AI & 14-Point Schema Analysis
- Uses Vercel AI SDK (`ai` & `@ai-sdk/google`) for structured object generation (`generateObject`) backed by Zod schemas:
  1. **Executive Summary**: High-level synthesis of meeting outcomes.
  2. **Client Pain Points**: Blockers and operational challenges expressed by the client.
  3. **Client Wants**: Desired goals and feature requests.
  4. **Client Needs**: Mandatory business & technical requirements.
  5. **Client Preferences**: Technology, workflow, design, or timing preferences.
  6. **Client Commitments**: Commitments made by the client.
  7. **Our Commitments**: Deliverables promised by our internal team.
  8. **Decision Makers**: Identified stakeholders and their organizational roles.
  9. **Changes Since Last Meeting**: Automated cross-meeting comparison with prior call history.
  10. **Technical Requirements**: Detailed functional specifications.
  11. **Key Decisions**: Solutions agreed upon during the call.
  12. **Action Items**: Concrete tasks with assigned **Owner** and **Deadline**.
  13. **Risks & Concerns**: Potential project, budget, or timeline risks.

### 📄 3. Google Workspace & Docs Integration
- Authenticates users via Google OAuth 2.0 (`openid`, `email`, `profile`, `documents`, `drive.file`).
- Programmatically formats Google Docs via Google Docs API (`v1`):
  - Formats titles with `TITLE` style.
  - Formats headers with dark-bold `HEADING_2` styles.
  - Builds structured bullet lists (`BULLET_DISC_CIRCLE_SQUARE`).
- Stores the document directly in the user's Google Drive and surfaces an **"Open in Google Docs"** button in the UI.

### 📊 4. Next.js 16 Dashboard & Task Engine
- **Live Metrics Dashboard**: Total meetings count, processed summaries, pending tasks, and client directory stats.
- **Chronological Deadline Tracker**: Aggregates all action items across meetings, highlighting deadlines and unassigned tasks.
- **Pipeline Status Badges**: Dynamic status indicators (`queued` ➔ `recording` ➔ `transcribing` ➔ `done` / `failed`).
- **Verbatim Transcript Inspector**: Built-in collapsible transcript reader.

---

## 🏗️ Architecture & Data Flow Diagram

```mermaid
flowchart TD
    subgraph Client [Next.js 16 App Router]
        DASH[Dashboard / Meetings List]
        UP[Upload & Schedule Page]
        VIEW[Meeting Details & Analysis View]
    end

    subgraph Bot [Python Google Meet Bot]
        RUNNER[google_meet_bot.runner]
        SELENIUM[Google Meet Automation]
        REC[Audio Recorder .wav]
    end

    subgraph Server [Node.js / Express 5 API]
        ROUTES[Express API Routes]
        CTRL[Meeting Controller]
        DB[(MongoDB Database)]
    end

    subgraph External [External Services & Cloud]
        GEMINI[Google Gemini 3.5 Flash AI]
        GDOCS[Google Docs & Drive API]
        GOAUTH[Google OAuth 2.0]
    end

    UP -->|1. Schedule Bot Meeting| ROUTES
    UP -->|Alt: Upload Audio File| ROUTES
    ROUTES -->|2. Queue Job (status: queued)| DB
    
    RUNNER -->|3. GET /meet/bot/next (x-bot-token)| ROUTES
    ROUTES -->|Claim Job (status: recording)| DB
    RUNNER -->|4. Launch Browser & Join Call| SELENIUM
    SELENIUM -->|5. Record Session Audio| REC
    RUNNER -->|6. POST /meet/bot/:id/recording| ROUTES
    
    ROUTES -->|7. Trigger Async Pipeline| CTRL
    CTRL -->|8. Transcribe Audio (Gemini STT)| GEMINI
    CTRL -->|9. Fetch Previous Client Notes| DB
    CTRL -->|10. Structured 14-Category Analysis| GEMINI
    CTRL -->|11. Save Notes & Tasks| DB
    CTRL -->|12. Generate Styled Google Doc| GDOCS
    GDOCS -->|Return Doc ID| CTRL
    
    DASH <-->|Poll Status & Fetch List| ROUTES
    VIEW <-->|Fetch Notes, Tasks & Doc Link| ROUTES
```

---

## 📂 Project Repository Structure

```
M-O-M.ai/
├── client/                              # Next.js 16 App Router Frontend
│   ├── app/
│   │   ├── page.tsx                     # Dashboard (Stats, Upcoming Deadlines, Call History)
│   │   ├── upload/page.tsx              # Meeting Bot Scheduler & File Upload Form
│   │   ├── meetings/[id]/page.tsx       # Detailed Meeting Report & Action Items
│   │   └── globals.css                  # Custom Glassmorphism UI & Animations
│   ├── components/                      # Shared UI Components
│   └── package.json
│
├── server/                              # Node.js Express Backend API
│   ├── config/                          # Database connection (db.ts)
│   ├── controllers/
│   │   ├── meeting.controller.ts        # Main Pipeline, Job Claiming, Doc Export
│   │   ├── auth.controller.ts           # Google OAuth 2.0 Controller
│   │   └── client.controller.ts         # Client Directory Controller
│   ├── middleware/                      # Auth JWT Middleware & Multer Audio Upload
│   ├── models/                          # Mongoose Models (User, Client, Meeting/Project)
│   ├── routes/                          # API Route Definitions
│   ├── services/
│   │   ├── gemini.service.ts            # Gemini STT & Zod Structured Analysis
│   │   └── google.service.ts            # Google OAuth Tokens & Docs API Formatting
│   ├── utils/                           # Zod meetingSchema validation
│   └── server.ts                        # Server Entry Point (Port 8000)
│
└── Google-Meet-Bot/                     # Python Headless Bot Subsystem
    ├── src/google_meet_bot/
    │   ├── runner.py                    # Background Worker Polling Loop
    │   ├── join_google_meet.py          # Selenium/Playwright Browser Automation
    │   ├── record_audio.py              # System Audio Recorder
    │   ├── speech_to_text.py            # Standalone Speech Transcribe Helper
    │   └── cli.py                       # Command Line Entry Point
    ├── pyproject.toml                   # Python Package Configuration
    ├── requirements.txt                 # Dependencies (requests, python-dotenv, etc.)
    └── README.md                        # Python Bot Specific Documentation
```

---

## 🔌 Complete API Endpoint Specification

### 🔑 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/auth/google` | Starts Google OAuth 2.0 login flow | No |
| `GET` | `/auth/google/callback` | OAuth redirect callback; sets session cookie | No |
| `GET` | `/auth/me` | Fetches current user profile | Session Cookie |

### 👥 Client Management (`/client`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/client/create` | Creates a new client entry | Session Cookie |
| `GET` | `/client/get` | Retrieves user's client list | Session Cookie |
| `GET` | `/client/get/:id` | Fetches client details by ID | Session Cookie |

### 🎙️ Meetings & AI Pipeline (`/meet`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/meet/get` | Fetches all meetings for dashboard | Session Cookie |
| `GET` | `/meet/get/:id` | Fetches single meeting analysis & transcript | Session Cookie |
| `DELETE` | `/meet/delete/:id` | Deletes meeting record | Session Cookie |
| `POST` | `/meet/schedule` | Queues Google Meet Bot job | Session Cookie |
| `POST` | `/meet/transcribe` | Uploads raw audio file & triggers AI pipeline | Session Cookie |

### 🤖 Bot Worker Protocol (`/meet/bot/*`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/meet/bot/next` | Claims next pending queued job | `x-bot-token` Header |
| `POST` | `/meet/bot/:id/recording` | Uploads recorded `.wav` file to trigger processing | `x-bot-token` Header |
| `POST` | `/meet/bot/:id/fail` | Reports bot execution failure | `x-bot-token` Header |

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- **Node.js** (v18.0+) & **npm**
- **Python** (v3.8+) & **pip**
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Google Cloud Console Credentials** (OAuth Client ID & Secret with Docs/Drive API enabled)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Environment Setup

#### 1. Server Environment (`server/.env`)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/mom_ai
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
BOT_TOKEN=your_shared_bot_security_token
```

#### 2. Client Environment (`client/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 3. Google Meet Bot Environment (`Google-Meet-Bot/src/google_meet_bot/.env`)
```env
API_BASE_URL=http://localhost:8000
BOT_TOKEN=your_shared_bot_security_token
POLL_SECONDS=15
EMAIL_ID=your_bot_gmail_address@gmail.com
EMAIL_PASSWORD=your_bot_gmail_password
```

---

### Step 2: Running the Services

#### 🚀 Launch Backend Server
```bash
cd server
npm install
npm run dev
# Server will start on http://localhost:8000
```

#### 💻 Launch Frontend Client
```bash
cd client
npm install
npm run dev
# Client will start on http://localhost:3000
```

#### 🤖 Launch Python Google Meet Bot Worker
```bash
cd Google-Meet-Bot
python -m venv env

# Activate environment:
# On Windows: env\Scripts\activate
# On Linux/macOS: source env/bin/activate

pip install -r requirements.txt
pip install -e .

# Run the runner in continuous polling mode:
python -m google_meet_bot.runner
```

---

## 📊 Presentation Deck Outline for PowerPoint (PPT)

*Use this exact slide-by-slide structure when creating your presentation deck:*

| Slide # | Slide Title | Core Visual Content | Speaker Script / Key Points |
| :--- | :--- | :--- | :--- |
| **Slide 1** | **Title Slide: M-O-M.ai** | Project Logo, Tagline (*Autonomous AI Meeting Intelligence*) | "Welcome! Today we present M-O-M.ai, an autonomous platform that turns client meetings into action items and Google Docs." |
| **Slide 2** | **The Problem** | 3 Key Challenges: Time Waste, Lost Action Items, Context Drift | "Teams lose 5-10 hours weekly taking meeting notes, and crucial client commitments get lost across calls." |
| **Slide 3** | **The Solution** | 4-Stage Lifecycle Diagram (Join ➔ Transcribe ➔ Analyze ➔ Sync) | "M-O-M.ai automates the process from live Meet recording to AI structured analysis and instant Google Docs publishing." |
| **Slide 4** | **Google Meet Bot** | Python Bot Architecture & Scheduler Form | "Our headless Python bot logs into Google Meet, records the session audio, and uploads it securely to the server." |
| **Slide 5** | **Gemini 3.5 AI Intelligence** | 14-Category Schema List & Cross-Meeting Delta | "Powered by Gemini 3.5 Flash, M-O-M.ai extracts action items with owners/deadlines and compares notes with past calls." |
| **Slide 6** | **Google Workspace Integration** | Styled Google Doc screenshot alongside Dashboard button | "Notes are automatically styled with titles, headings, and bullet points and saved directly into the user's Google Drive." |
| **Slide 7** | **System Architecture** | Next.js 16 + Express 5 + MongoDB + Python Bot + Gemini | "Built with modern full-stack technologies for reliability, security, and developer productivity." |
| **Slide 8** | **Live Product Demo** | Screenshots of Dashboard, Upload Page, and Meeting Detail View | "Let's look at the UI: schedule a bot, track real-time processing status, view deadlines, and access Google Docs." |
| **Slide 9** | **Business Impact & ROI** | Key Metrics (90% admin time saved, 0 lost deadlines) | "M-O-M.ai drastically reduces administrative overhead and ensures 100% accountability on team promises." |
| **Slide 10** | **Roadmap & Conclusion** | Multi-platform bot (Zoom/Teams), Slack/Jira sync, Q&A | "Thank you! We are expanding to Zoom & Teams next. We welcome any questions." |

---

<p align="center">
  <i>Built with ❤️ using Next.js 16, Express 5, Python, MongoDB, and Google Gemini AI</i>
</p>
