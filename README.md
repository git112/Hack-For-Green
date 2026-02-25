# 🌍 CleanAirGov: Real-Time Air Quality & GovTech Action Platform

A sophisticated GovTech ecosystem for real-time air pollution monitoring, citizen-led reporting, and automated government enforcement.

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Pathway%20%7C%20Gemini-blue)](#-technology-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Beta-orange)](#)

## � Overview

CleanAirGov combines **Pathway real-time streaming**, **Gemini-powered RAG analysis**, and a **modern React dashboard** to bridge the gap between citizen awareness and government action.

| Feature | Description |
| :--- | :--- |
| **Real-Time AQI Streaming** | Live pollution data ingestion every 5 seconds per ward. |
| **AI-Powered Reporting** | Image recognition to detect garbage burning, smoke, and industrial leaks. |
| **Kanban Action Center** | Government officials can assign, track, and resolve reports in real-time. |
| **RAG Policy Chatbot** | Gemini-powered assistant for health advisories and environmental regulations. |
| **Clean Navigation** | Find the healthiest (not just fastest) route to your destination. |
| **Rewards Wallet** | Gamified "Green Credits" system for active citizen participation. |

## 🎥 Project Demo

- 📽️ **Video Walkthrough:**  
  https://drive.google.com/file/d/1q00vabVoV1odN-EKE_G3Dmk3DXT1mhX6/view?usp=drive_link  

- 🌐 **Live Deployment:**  
  https://city-air-gov.vercel.app/


## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        CleanAirGov System                       │
│                                                                 │
│  ┌──────────────┐      API Request     ┌────────────────────────┐  │
│  │   Frontend   │ ───────────────────► │    Backend Server      │  │
│  │ (React :5173) │ ◄─────────────────── │    (Node.js :3000)     │  │
│  └──────────────┘      JSON Response   └──────────┬─────────────┘  │
│                                                   │               │
│                                    ┌──────────────┴──────────────┐│
│                                    │                             ││
│                        ┌───────────▼───────────┐     ┌───────────▼───────────┐
│                        │    Pathway Engine     │     │      Gemini AI        │
│                        │   - Stream Joins      │     │   - RAG Analysis      │
│                        │   - Spike Detection   │     │   - Image Detection   │
│                        │   - Rolling Averages  │     │   - Policy Insights   │
│                        └───────────┬───────────┘     └───────────────────────┘
│                                    │                              │
│                        ┌───────────▼───────────┐                  │
│                        │       MongoDB         │ ◄────────────────┘
│                        │   - User Profiles     │
│                        │   - Action Reports    │
│                        └───────────────────────┘
└─────────────────────────────────────────────────────────────────┘



## 📂 Project Structure

```text
city-air-watch-main/
├── src/                    # Frontend (Vite + React + TS)
│   ├── pages/              # Citizen Dashboard, Admin Action Center, AI Report
│   ├── components/         # Live Map, AQI Cards, Kanban Board
│   ├── hooks/              # useToast, useAuth, useStream
│   └── services/           # API integration layers
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/        # Mongoose Schemas (Reports, Users, Wards)
│   │   ├── routes/        # Auth, Reports, and Stream API endpoints
│   │   └── controllers/   # Business logic & AI orchestration
│   └── .env               # Secrets (JWT, Mongo, Gemini Key)
├── pathway_service/        # Analytics (Python + Pathway)
│   ├── pathway_engine.py   # Core streaming logic & spike detection
│   └── data/               # Reference documents for RAG
├── start-all.bat           # Automated environment launcher
└── package.json            # Root configuration


## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+
- **Python**: 3.10+
- **MongoDB**: Active instance (Local or Atlas)
- **API Key**: Google Gemini API key from [AI Studio](https://aistudio.google.com/)

### 1. Setup Environment
Create a `.env` file in the `server/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secret_key
PORT=3000


### 2. Install Dependencies
```bash
# Install Frontend & Backend dependencies
npm install
cd server && npm install
cd ..

# Install Python dependencies
pip install pathway google-generativeai fastapi uvicorn python-dotenv
```

### 3. Launch the Platform
**Automatic (Windows):**
```bash
./start-all.bat


**Manual:**
- **Pathway:** `python pathway_service/pathway_engine.py`
- **Backend:** `cd server && npm run dev`
- **Frontend:** `npm run dev`



## � API Endpoints

### 🏛️ Government API (Port 3000)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/pending` | Fetch all active pollution reports for admin. |
| `POST` | `/api/auth/register` | Unified registration for Citizens & Officials. |
| `PATCH` | `/api/reports/:id` | Update status (New → In Progress → Resolved). |

### 🤖 AI & Analytics (Port 5000)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | RAG-powered chatbot with city context. |
| `WS/SSE` | `/api/stream/aqi` | Real-time AQI stream with rolling averages. |

---

## 🛠️ Technology Stack

- **Processing:** [Pathway](https://pathway.com/) (High-throughput data joins & reducers)
- **Intelligence:** [Google Gemini 1.5 Flash](https://aistudio.google.com/) (Vision & RAG)
- **Frontend:** React 18, Tailwind CSS, Shadcn/UI, Framer Motion
- **Database:** MongoDB (Persistent storage for accounts & reports)

---

## � Demo Credentials
- **Role:** Administrative Officer
- **Email:** `admin@gov.in`
- **Password:** `admin123`

---

Developed for **Hack-For-Green** 🌿 | Ensuring a Breathable Future.
