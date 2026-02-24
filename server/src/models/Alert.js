import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['aqi_alert', 'health_advisory', 'traffic_advisory', 'construction_alert', 'enforcement', 'general'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    wards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
      },
    ],
    targetGroups: {
      type: [String],
      enum: ['all', 'children', 'elderly', 'asthmatics', 'outdoor_workers'],
    },
    recommendations: [String],
    healthImpact: String,
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentVia: {
      sms: Boolean,
      push: Boolean,
      email: Boolean,
      website: Boolean,
    },
    startTime: Date,
    endTime: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

alertSchema.index({ wards: 1, status: 1 });
alertSchema.index({ createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
