import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
    title: String,
    description: String,
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'completed', 'overdue'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    deadline: Date,
    startDate: Date,
    completionDate: Date,
    notes: String,
    actionDetails: {
      actionType: String,
      location: String,
      equipment: [String],
      estimatedCost: Number,
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ ward: 1, status: 1 });
taskSchema.index({ deadline: 1 });

export default mongoose.model('Task', taskSchema);
