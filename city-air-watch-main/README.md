# 🌍 GovAir: Smart City Air Quality Management Platform

A sophisticated GovTech platform designed for real-time air pollution monitoring, citizen reporting, AI-powered insights, and automated government action management.

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Pathway%20%7C%20MongoDB-blue)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 Overview

GovAir empowers both citizens and government officials to combat urban air pollution. By integrating **Live AQI Streaming**, **AI-Powered Image Recognition**, and **RAG-based Analytics**, the platform creates a transparent and efficient ecosystem for environmental management.

### Key Capabilities:
- **For Citizens:** Personal safety dashboards, clean-route navigation, and a reward system for reporting pollution.
- **For Governments:** Real-time spike detection, automated task allocation (Kanban), and city-wide analytics.
- **AI Integration:** Automated detection of pollution sources from photos and a role-aware RAG chatbot for health advisories.

---

## ✨ Key Features

### 👤 Citizen Experience
- **Smart Reporting:** Take a photo of a pollution source (garbage burning, industrial smoke) and let AI detect it instantly.
- **Clean Navigation:** Find the healthiest route to your destination based on real-time AQI data.
- **Rewards Wallet:** Earn "Green Credits" for every verified report and redeem them for civic perks.
- **Live Safety Map:** View a 5km radius map with color-coded safety zones.

### 🏛️ Government Command Center
- **Action Center:** A Kanban-based task board to manage citizen reports and assign cleanup crews.
- **Live AQI Monitoring:** 5-second interval streaming with custom threshold alerts and spike detection.
- **Broadcast System:** Send ward-specific health alerts and emergency notifications to citizens.
- **Policy Simulation:** Predict future air quality trends using historical data and AI models.

### 🤖 AI & Streaming Intelligence
- **Pathway Streaming Engine:** Computes rolling averages and detects pollution spikes in real-time.
- **Gemini RAG Chatbot:** Role-aware assistant trained on WHO and Government environmental guidelines.
- **E-Penalty System:** Automated violation logging to reduce delay and prevent corruption.

---

## �️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend:** Node.js, Express, Mongoose, JWT Authentication
- **Streaming & AI:** Pathway (Python), Google Gemini AI API
- **Database:** MongoDB (Cloud or Local)
- **Maps:** Leaflet.js / React-Leaflet

---

## 📂 Project Structure

```text
city-air-watch-main/
├── src/                    # Frontend React Source
│   ├── components/         # Reusable UI components
│   ├── pages/              # Role-based dashboards & tools
│   ├── hooks/              # Custom React hooks
│   └── store/              # State management
├── server/                 # Node.js Express Backend
│   ├── src/
│   │   ├── models/        # MongoDB Schemas
│   │   ├── routes/        # API Endpoints
│   │   └── controllers/   # Business Logic
│   └── .env               # Backend Configuration
├── pathway_service/        # Python Streaming Engine
│   ├── pathway_engine.py   # Core streaming & AI detection logic
│   └── data/               # Thresholds & Document storage
├── public/                 # Static assets
└── start-all.bat           # One-click startup script
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.10+](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Gemini API Key

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/git112/Hack-For-Green.git
   cd city-air-watch-main
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create a .env file based on the Environment Variables section below
   ```

3. **Frontend Setup**
   ```bash
   cd ..
   npm install
   ```

4. **Pathway Engine Setup**
   ```bash
   pip install pathway fastapi uvicorn google-generativeai python-dotenv
   ```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB connection string |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `JWT_SECRET` | Secret key for user authentication |
| `PORT` | 3000 |

### Frontend (`.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | http://localhost:3000 |

---

## ▶️ Running the Application

### Option 1: Automated Startup (Windows)
Run the root batch script:
```bash
./start-all.bat
```

### Option 2: Manual Startup
1. **Pathway Engine:** `python pathway_service/pathway_engine.py` (Port 5000)
2. **Backend:** `cd server && npm run dev` (Port 3000)
3. **Frontend:** `npm run dev` (Port 5173)

---

## 🔐 Credentials for Testing
- **Role:** Administrator
- **Username:** `admin` or `admin@gov.in`
- **Password:** `admin123`

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
Developed for **Hack-For-Green** 🌿
