import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    wardName: String,
    forecastDate: Date,
    predictions: [
      {
        hour: Number,
        predictedAQI: Number,
        predictedLevel: String,
        confidence: Number,
        pollutants: {
          pm25: Number,
          pm10: Number,
          o3: Number,
        },
      },
    ],
    sourceContribution: {
      traffic: { value: Number, percentage: Number },
      construction: { value: Number, percentage: Number },
      industrial: { value: Number, percentage: Number },
      residentialBurning: { value: Number, percentage: Number },
      other: { value: Number, percentage: Number },
    },
    riskAssessment: {
      schoolsAffected: [String],
      hospitalZones: [String],
      vulnerableGroups: [String],
      recommendations: [String],
    },
    confidenceScore: Number,
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

predictionSchema.index({ ward: 1, forecastDate: -1 });

export default mongoose.model('Prediction', predictionSchema);
