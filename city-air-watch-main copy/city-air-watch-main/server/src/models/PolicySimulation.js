import mongoose from 'mongoose';

const policySimulationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
    city: String,
    simulationType: {
      type: String,
      enum: ['traffic_restriction', 'construction_ban', 'road_sprinkling', 'factory_closure', 'vehicle_ban', 'custom'],
      required: true,
    },
    parameters: {
      trafficReduction: Number,
      constructionReduction: Number,
      industrialReduction: Number,
      vehicleRestrictionType: String,
      sprayingIntensity: String,
    },
    baselineAQI: Number,
    predictedAQIReduction: {
      percentage: Number,
      expectedAQI: Number,
      timeframe: String,
    },
    costEstimate: Number,
    implementationDays: Number,
    risks: [String],
    benefits: [String],
    impact: {
      healthBenefit: String,
      respiratoryCasesReduced: Number,
      childrenBenefited: Number,
      economicImpact: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'simulated', 'approved', 'implemented', 'archived'],
      default: 'draft',
    },
    startDate: Date,
    endDate: Date,
    actualResults: {
      implementedDate: Date,
      actualAQIReduction: Number,
      actualAQI: Number,
      healthOutcomes: String,
    },
  },
  { timestamps: true }
);

policySimulationSchema.index({ ward: 1, createdAt: -1 });
policySimulationSchema.index({ status: 1 });

export default mongoose.model('PolicySimulation', policySimulationSchema);
