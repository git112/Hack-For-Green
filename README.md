# 🌍 CleanAirGov
### *Real-Time Air Quality Civic Intelligence Platform*

> **Transforming ward-level air quality data into actionable governance insights — because clean air isn't a luxury, it's a right.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org/)
[![Built for](https://img.shields.io/badge/Built%20for-Hack--For--Green-forestgreen)](/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-city--air--gov.vercel.app-orange)](https://city-air-gov.vercel.app/)

---

## 🎬 See It In Action

| 🌐 Live Platform | 🎥 Video Demo |
|:---:|:---:|
| [**city-air-gov.vercel.app**](https://city-air-gov.vercel.app/) | [**Watch Walkthrough →**](https://drive.google.com/file/d/1q00vabVoV1odN-EKE_G3Dmk3DXT1mhX6/view) |

---

## 🧠 What is CleanAirGov?

Traditional AQI dashboards show you a **single number for an entire city**. That's like diagnosing a patient by averaging their entire body temperature.

**CleanAirGov is different.**

It operates at **micro-ward resolution** — tracking pollution at the neighborhood level with continuous real-time monitoring, AI-assisted citizen reporting, and direct integration into administrative enforcement workflows. When air quality spikes in Ward 14B at 3:47 PM, the right government official knows about it at 3:47 PM, not next Tuesday's report.

```
🏭 Ward Sensor → 📡 Pathway Stream → 🤖 AI Analysis → 👮 Official Action → 🌱 Cleaner Air
```

---

## ✨ Core Capabilities

| 🔧 Capability | 📝 Description |
|---|---|
| 🗺️ **Ward-Level AQI Monitoring** | Continuous pollution tracking at micro-ward resolution — not city averages |
| ⚡ **Real-Time Streaming** | Live AQI analytics updated every ~5 seconds via Pathway streaming engine |
| 🤖 **AI Report Verification** | Gemini Vision classifies citizen-submitted pollution photos automatically |
| 🏛️ **Administrative Action Center** | Task assignment, escalation workflows, and enforcement tracking for officials |
| 💬 **Environmental Knowledge Assistant** | RAG-powered chatbot for regulations, health advisories, and policy guidance |
| 🧭 **Exposure-Aware Navigation** | Route recommendations optimized for minimal pollution exposure |
| 🌱 **Green Credits System** | Gamified incentives rewarding active citizen environmental participation |

---

## 🏗️ System Architecture

CleanAirGov uses an **event-driven streaming architecture** — not batch processing — ensuring zero-lag between environmental events and civic response.

```
┌─────────────────────────────────────────────────────────┐
│              🖥️  Frontend (React + Tailwind)             │
│         Real-time dashboards, citizen app, admin UI      │
└────────────────────────┬────────────────────────────────┘
                         │  REST APIs / SSE Streams
                         ▼
┌─────────────────────────────────────────────────────────┐
│           ⚙️  Backend Server (Node.js + Express)         │
│                                                         │
│  ┌──────────────────────┐   ┌─────────────────────────┐ │
│  │  📡 Pathway Streaming │   │   🤖 AI Services        │ │
│  │  - AQI ingestion     │   │   - RAG Chatbot         │ │
│  │  - Rolling averages  │   │   - Image verification  │ │
│  │  - Spike detection   │   │   - Google Gemini       │ │
│  │  - Alert generation  │   └─────────────────────────┘ │
│  └──────────────────────┘                               │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🗄️  MongoDB  │  Users · Reports · Ward Data    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Real-Time Processing Pipeline

Every AQI reading flows through a 5-stage intelligent pipeline:

```
1️⃣  AQI Data Ingestion
        ↓
2️⃣  Rolling Window Analysis
        ↓
3️⃣  Spike Detection (anomaly flagging)
        ↓
4️⃣  Alert Generation (automated notifications)
        ↓
5️⃣  Live Dashboard Updates (SSE push to all clients)
```

Updates arrive every **~5 seconds**. Spikes are caught before they become crises.

---

## 🤖 AI Components

### 📸 Image Verification Engine
Citizens submit photos of pollution events. Gemini Vision automatically classifies them — no manual triage needed.

**Detectable pollution types:**
- 🔥 Garbage burning
- 💨 Smoke emissions
- 🏭 Industrial leaks
- 🗑️ Illegal waste dumping

### 💬 RAG Environmental Assistant
A retrieval-augmented chatbot grounded in actual environmental regulations and health guidelines.

**Can answer questions about:**
- 📋 Environmental regulations and compliance
- ⚠️ Health advisories for vulnerable populations
- 🔬 Pollution source explanations
- 📜 Government guidelines and citizen rights

---

## 🛠️ Technology Stack

### 🎨 Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-latest-black)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-FF0055?logo=framer)

### ⚙️ Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-4-000000?logo=express)
![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?logo=jsonwebtokens)

### 📡 Real-Time Processing
![Pathway](https://img.shields.io/badge/Pathway-Streaming-FF6B35)
![SSE](https://img.shields.io/badge/Server--Sent_Events-Live-green)

### 🤖 AI / ML
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google)
![RAG](https://img.shields.io/badge/RAG-Retrieval_Augmented-purple)
![Vision](https://img.shields.io/badge/Vision_Classification-Gemini-blue)

### 🗄️ Database
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Mongoose](https://img.shields.io/badge/Mongoose-ORM-880000)

---

## 📂 Project Structure

```
city-air-watch-main/
│
├── 📁 src/                          # Frontend (React + TypeScript)
│   ├── 📁 pages/                    # Route-level page components
│   ├── 📁 components/               # Reusable UI components
│   ├── 📁 hooks/                    # Custom React hooks
│   └── 📁 services/                 # API service layer
│
├── 📁 server/                       # Backend (Node.js + Express)
│   └── 📁 src/
│       ├── 📁 models/               # Mongoose data models
│       ├── 📁 routes/               # API route definitions
│       └── 📁 controllers/          # Business logic controllers
│
├── 📁 pathway_service/              # Streaming Engine (Python)
│   ├── 🐍 pathway_engine.py         # Core streaming logic
│   └── 📁 data/                     # Sample AQI datasets
│
├── 🚀 start-all.bat                 # One-click startup script
└── 📦 package.json
```

---

## 🚀 Quick Start

### 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** 18 or higher
- ✅ **Python** 3.10 or higher
- ✅ **MongoDB** instance (local or Atlas)
- ✅ **Gemini API Key** ([Get one free here](https://aistudio.google.com/))

---

### ⚙️ Environment Setup

Create a `.env` file inside the `server/` directory:

```env
# 🗄️ Database
MONGODB_URI=your_mongodb_connection_string

# 🤖 AI
GEMINI_API_KEY=your_gemini_api_key

# 🔐 Auth
JWT_SECRET=your_secret_key_here

# 🌐 Server
PORT=3000
```

---

### 📦 Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install Python streaming dependencies
pip install pathway google-generativeai fastapi uvicorn python-dotenv
```

---

### ▶️ Run the Application

#### 🪄 One-Click Start (Windows)
```bash
./start-all.bat
```

#### 🔧 Manual Start (Cross-platform)

**Terminal 1 — Pathway Streaming Engine:**
```bash
python pathway_service/pathway_engine.py
```

**Terminal 2 — Backend API Server:**
```bash
cd server && npm run dev
```

**Terminal 3 — Frontend Dev Server:**
```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) 🎉

---

## 📡 API Reference

### 🏛️ Government API — Port `3000`

| Method | Endpoint | 🔒 Auth | Description |
|--------|----------|---------|-------------|
| `GET` | `/api/reports/pending` | ✅ JWT | Fetch all pending citizen pollution reports |
| `POST` | `/api/auth/register` | ❌ Public | Register as citizen or government official |
| `PATCH` | `/api/reports/:id` | ✅ JWT | Update report status (approve/reject/escalate) |

### ⚡ AI & Streaming API — Port `5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | RAG-powered environmental chatbot query |
| `SSE` | `/api/stream/aqi` | Real-time AQI data stream (Server-Sent Events) |

---

## 🔐 Demo Access

Want to explore the admin interface? Use these credentials:

```
👤 Role:     Administrative Officer
📧 Email:    admin@gov.in
🔑 Password: admin123
```

> ⚠️ *For demonstration purposes only. Do not use in production.*

---

## 📈 Performance Characteristics

| 📊 Metric | ⚡ Value |
|-----------|---------|
| AQI Update Frequency | **~5 seconds** |
| Streaming Method | **Server-Sent Events (SSE)** |
| Processing Engine | **Pathway Streaming Framework** |
| Architecture Pattern | **Event-Driven** |
| Geographic Resolution | **Ward-Level (micro)** |

---

## 🔮 Roadmap & Future Work

CleanAirGov is built to grow. Here's what's coming:

- 📡 **IoT Sensor Integration** — Direct hardware sensor onboarding for denser coverage
- 🌆 **Multi-City Deployment** — Federated architecture supporting multiple municipal instances
- 🔮 **Advanced Forecasting** — ML-based AQI prediction models (24h, 72h ahead)
- 📱 **Mobile Application** — Native iOS/Android apps for citizens and field officers
- 🖥️ **Edge Processing** — On-device data processing to reduce latency and bandwidth
- 🧮 **Policy Simulation Engine** — Model the AQI impact of proposed regulations before enacting them

---

## 🤝 Contributing

Contributions are welcome! CleanAirGov is an open civic technology project.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

```
MIT License

Copyright (c) 2026 CleanAirGov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

See [LICENSE](./LICENSE) for full text.

---

## 👨‍💻 About

**CleanAirGov** was developed for **Hack-For-Green** as a demonstration of how real-time streaming analytics, AI, and civic data systems can be combined to make environmental governance faster, smarter, and more accountable.

> *"The best time to act on air pollution was yesterday. The second best time is right now — with real data."*

---

<div align="center">

**🌱 Built with purpose. Deployed for people. Powered by data.**

[Live Demo](https://city-air-gov.vercel.app/) · [Video Walkthrough](https://drive.google.com/file/d/1q00vabVoV1odN-EKE_G3Dmk3DXT1mhX6/view) · [Report an Issue](https://github.com/your-repo/issues)

</div>
