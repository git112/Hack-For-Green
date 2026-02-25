import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    wardName: String,
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    description: String,
    pollutionType: {
      type: String,
      enum: ['garbage_burn', 'dust', 'smoke', 'traffic', 'construction', 'industrial', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    photos: [String],
    videos: [String],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
    },
    address: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    aiConfidence: Number,
    aiAnalysis: {
      detectedType: String,
      confidence: Number,
      details: String,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: Date,
    dueDate: Date,
    actionTaken: String,
    resolvedDate: Date,
    greenPointsAwarded: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        comment: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

reportSchema.index({ citizen: 1, createdAt: -1 });
reportSchema.index({ ward: 1, status: 1 });
reportSchema.index({ timestamp: -1 });
reportSchema.index({ location: '2dsphere' });

export default mongoose.model('Report', reportSchema);
