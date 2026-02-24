import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['alert', 'advisory', 'information', 'enforcement'],
      default: 'alert',
    },
    wards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
      },
    ],
    broadcastTo: {
      type: [String],
      enum: ['all', 'citizens', 'officers', 'admins'],
    },
    channels: {
      sms: Boolean,
      push: Boolean,
      email: Boolean,
      website: Boolean,
    },
    sentAt: Date,
    scheduledFor: Date,
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientCount: Number,
    successCount: Number,
    failureCount: Number,
    attachments: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

broadcastSchema.index({ status: 1, createdAt: -1 });
broadcastSchema.index({ wards: 1 });

export default mongoose.model('Broadcast', broadcastSchema);
