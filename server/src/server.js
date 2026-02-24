// Load environment variables FIRST, before any imports that might use them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'express-async-errors';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { protect, authorize } from './middleware/auth.js';

// Import controllers
import * as authController from './controllers/authController.js';
import * as aqiController from './controllers/aqiController.js';
import * as wardController from './controllers/wardController.js';
import * as alertController from './controllers/alertController.js';
import * as reportController from './controllers/reportController.js';
import * as healthController from './controllers/healthController.js';
import * as predictionController from './controllers/predictionController.js';
import * as policyController from './controllers/policyController.js';
import * as broadcastController from './controllers/broadcastController.js';
import * as chatbotController from './controllers/chatbotController.js';
import { setupStreamRoutes, initStreamBridge } from './streamBridge.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', protect, authController.getProfile);
app.put('/api/auth/profile', protect, authController.updateProfile);

// Ward routes
app.get('/api/wards', wardController.getAllWards);
app.get('/api/wards/map', wardController.getWardMap);
app.get('/api/wards/nearby', wardController.getNearbyWards);
app.get('/api/wards/:id', wardController.getWardById);
app.get('/api/wards/name/:name', wardController.getWardByName);
app.get('/api/wards/:wardId/aqi', wardController.getWardAQI);
app.post('/api/wards', protect, authorize('admin'), wardController.createWard);
app.put('/api/wards/:id', protect, authorize('admin'), wardController.updateWard);

// AQI routes
app.get('/api/aqi/city', aqiController.getCityAQI);
app.get('/api/aqi/ward/:wardId', aqiController.getCurrentAQI);
app.get('/api/aqi/ward/:wardId/history', aqiController.getAQIHistory);
app.get('/api/aqi/ward/:wardId/trends', aqiController.getAQITrends);
app.post('/api/aqi', protect, authorize('admin', 'officer'), aqiController.recordAQIData);

// Health Impact routes
app.post('/api/health', protect, authorize('admin', 'officer'), healthController.createHealthImpactData);
app.get('/api/health/ward/:wardId', healthController.getWardHealthImpact);
app.get('/api/health/city', healthController.getCityHealthOverview);
app.get('/api/health/ward/:wardId/risk-zones', healthController.getRiskZones);
app.get('/api/health/ward/:wardId/trends', healthController.getHealthTrends);
app.get('/api/health/ward/:wardId/recommendations', healthController.getHealthRecommendations);

// Prediction routes
app.get('/api/predictions/city', predictionController.getCityWidePredictions);
app.get('/api/predictions/ward/:wardId', predictionController.getPrediction);
app.get('/api/predictions/ward/:wardId/48h', predictionController.get48HourPrediction);
app.get('/api/predictions/ward/:wardId/sources', predictionController.getSourceAnalysis);
app.get('/api/predictions/ward/:wardId/risk', predictionController.getRiskAssessment);
app.post('/api/predictions', protect, authorize('admin', 'officer'), predictionController.createPrediction);

// Alert routes
app.get('/api/alerts', alertController.getActiveAlerts);
app.get('/api/alerts/ward/:wardId', alertController.getWardAlerts);
app.get('/api/alerts/:id', alertController.getAlertById);
app.post('/api/alerts', protect, authorize('admin', 'officer'), alertController.createAlert);
app.put('/api/alerts/:id', protect, authorize('admin', 'officer'), alertController.updateAlert);
app.put('/api/alerts/:id/resolve', protect, authorize('admin', 'officer'), alertController.resolveAlert);

// Report routes
app.get('/api/reports/pending', protect, authorize('admin', 'officer'), reportController.getPendingReports);
app.get('/api/reports/citizen', protect, reportController.getCitizenReports);
app.get('/api/reports/ward/:wardId', protect, authorize('admin', 'officer'), reportController.getWardReports);
app.get('/api/reports/:id', protect, reportController.getReportById);
app.post('/api/reports', protect, reportController.createReport);
app.put('/api/reports/:id/status', protect, authorize('admin', 'officer'), reportController.updateReportStatus);
app.put('/api/reports/:id/assign', protect, authorize('admin', 'officer'), reportController.assignReport);
app.post('/api/reports/:id/comment', protect, reportController.addComment);

// Policy Simulation routes
app.get('/api/policies', policyController.getAllSimulations);
app.get('/api/policies/ward/:wardId', policyController.getSimulationsByWard);
app.get('/api/policies/:id', policyController.getSimulation);
app.post('/api/policies', protect, authorize('admin', 'officer'), policyController.createSimulation);
app.put('/api/policies/:id', protect, authorize('admin', 'officer'), policyController.updateSimulation);

// Broadcast routes
app.get('/api/broadcasts', protect, authorize('admin', 'officer'), broadcastController.getAllBroadcasts);
app.get('/api/broadcasts/ward/:wardId', broadcastController.getWardBroadcasts);
app.get('/api/broadcasts/:id', protect, authorize('admin', 'officer'), broadcastController.getBroadcast);
app.post('/api/broadcasts', protect, authorize('admin', 'officer'), broadcastController.createBroadcast);
app.put('/api/broadcasts/:id', protect, authorize('admin', 'officer'), broadcastController.updateBroadcast);

// Chatbot routes
app.post('/api/chatbot/chat', chatbotController.chat);

// Pathway Stream routes
setupStreamRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB (optional - chatbot works without it)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/city-air-watch');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️  Server will continue without MongoDB (chatbot will still work)`);
    return false;
  }
};

// Start server
const startServer = async () => {
  // Try to connect to MongoDB, but don't block server startup
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Chatbot endpoint: http://localhost:${PORT}/api/chatbot/chat`);
    console.log(`📡 Stream endpoint:  http://localhost:${PORT}/api/stream/live`);
    // Start Pathway stream bridge
    initStreamBridge();
  });
};

startServer();

