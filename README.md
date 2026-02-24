🌍 GovTech Air Quality Management Platform (GovAir)

A smart GovTech web platform for real-time air pollution monitoring, citizen reporting, AI-powered insights, and government action management.
The system integrates live AQI streaming, AI detection, RAG-based chatbot, and role-based dashboards for citizens and government officials.

🚀 Project Vision

GovAir aims to:

Empower citizens to report pollution issues and earn rewards

Help governments monitor pollution hotspots in real time

Enable data-driven decision making using AI and streaming analytics

Improve public health awareness through live AQI insights

🧭 Website Flow Overview

The platform is divided into three major user flows:

Public Flow – Accessible without login

Citizen Flow – Reporting, navigation, and rewards

Government Flow – Monitoring, analytics, and action management

🌐 1. PUBLIC FLOW (Entry Point)

Accessible to everyone before logging in.

🏠 Page 1: Landing Page (Home)

Header: Logo, Navigation (Home, Live Map, Login, Register)

Hero Section

Headline: Smart Pollution Action for [City Name]

Live AQI Widget (e.g., 150 AQI – Moderate)

Search Bar: Enter Pincode or Ward

Features Section

Clean Route Navigation

Earn Credits for Reporting

AI-Based Pollution Detection

Footer

Emergency Numbers

Copyright

📝 Page 2: Registration

Toggle Role Selection

Citizen

Government

Citizen Registration

Name, Email, Password

Home Ward (Dropdown)

Government Registration

Name, Employee ID

Official Email, Password

Assigned Zone

🔐 Page 3: Login

Email & Password

Role-Based Redirection

Citizen → Citizen Dashboard

Officer/Admin → Admin Dashboard

👤 2. CITIZEN FLOW (After Login)

Focused on personal safety, reporting, and rewards.

🏡 Page 4: Citizen Dashboard

Welcome Message with Wallet Balance

My Ward AQI Status Card

Local Safety Map

5 km radius

Green (Safe) / Red (Unsafe) zones

Quick Actions

Report Issue

Find Clean Route

📸 Page 5: Smart Report (AI Camera)

Upload / Capture Photo

AI Detection Animation

Result Example:

Garbage Burning Detected (98% confidence)

Submit Report to Government

Reward Confirmation:

+50 Credits Earned

🧭 Page 6: Clean Navigation

Input: Start Point & Destination

Output:

Route A: Fast but Polluted (Red)

Route B: Clean & Healthy (Green – Recommended)

Map Visualization of Both Routes

🎁 Page 7: Rewards Wallet

Total Credits Display

Redeemable Coupons

Example: Free Bus Ticket – 200 Credits

🏛️ 3. GOVERNMENT FLOW (After Login)

Focused on monitoring, analytics, and action execution.

📊 Page 8: Admin Dashboard (Command Center)

City Overview Stats

Critical Wards

Active Complaints

Average City AQI

Heatmap

City-wide pollution hotspots

AI Prediction Alerts

Example: AQI predicted to rise in Ward 5 tomorrow

🗂️ Page 9: Action Center (Task Board)

Kanban Board

New Reports

In Progress

Resolved

Task Card Details

Issue Description

Evidence Photo

Assign Cleanup Crew

📢 Page 10: Broadcast & Alerts

Select Target Ward

Message Type (Dust Alert, Health Warning, etc.)

Send SMS / App Notifications

📈 Page 11: Analytics

Monthly Pollution Trends

Pollution Source Breakdown

Traffic

Industry

Export Reports (PDF)

🤖 GovAir AI Chatbot

A role-based, AI-powered assistant available on all pages.

🔑 Key Features

Role-aware responses (Public, Citizen, Officer, Admin)

Uses live AQI + predictions + health guidelines

Neutral, factual, and non-political

Floating chat button (always accessible)

🧠 Role-Based Capabilities
Role	Capabilities
Public	AQI info, health advisories
Citizen	Ward-specific data, reporting help
Officer	Technical analysis & enforcement insights
Admin	City-wide analytics & policy simulation
⚙️ Environment Setup
Backend (server/.env)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
MONGODB_URI=your_mongodb_uri
Frontend (.env)
VITE_API_URL=http://localhost:3000
🧪 Troubleshooting: ERR_CONNECTION_REFUSED

Start backend server:

cd server
npm run dev

Verify server health:

curl http://localhost:3000/health

Ensure MongoDB is running

Confirm .env file exists in server/

🧩 System Architecture
INGESTION LAYER
• Ward Sensors → Simulated AQI Stream (5s)

STREAMING ENGINE (Pathway)
• Rolling Average (20 samples)
• Spike Detection (+30%)
• Threshold Alerts (150 / 200 / 300)

AI LAYER
• Document Store (WHO + Govt Rules)
• RAG Pipeline (Live AQI + Docs → Gemini)

FRONTEND
• React Dashboard
• Live AQI Updates (SSE)
• Stream Monitor & Console
▶️ How To Run the Project
Option 1: Automated (Recommended)
start-all.bat
Option 2: Manual

Terminal 1 – Pathway Engine

python pathway_service/pathway_engine.py

Terminal 2 – Backend

cd server
npm run dev

Terminal 3 – Front-End

npm run dev
🌐 Service URLs
Service	URL
Frontend	http://localhost:8080

Admin Stream Monitor	http://localhost:8080/admin/stream

Backend API	http://localhost:3000

Pathway Engine	http://localhost:5000

Stream Logs	http://localhost:3000/api/stream/logs
✅ Features Implemented

Live AQI Streaming (5s interval)

Rolling Average Window Functions

Spike Detection (+30%)

Automatic AQI Threshold Alerts

AI RAG Chatbot (Gemini)

WHO + Govt Document Store

Real-time Dashboard Updates (No Refresh)

Stream Monitoring Console
