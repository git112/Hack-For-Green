import mongoose from 'mongoose';

const healthImpactSchema = new mongoose.Schema(
  {
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
    wardName: String,
    date: Date,
    aqiLevel: String,
    currentAQI: Number,
    respiratoryCases: {
      total: Number,
      pediatric: Number,
      geriatric: Number,
      asthmatics: Number,
      occupationalLung: Number,
    },
    hospitalAdmissions: {
      respiratory: Number,
      cardiovascular: Number,
      neurological: Number,
    },
    affectedPopulation: {
      children: Number,
      elderly: Number,
      total: Number,
    },
    riskZones: [
      {
        zone: String,
        riskLevel: String,
        affectedInstitutions: {
          schools: Number,
          hospitals: Number,
          dayCares: Number,
        },
      },
    ],
    heatwaveData: {
      temperature: Number,
      humidity: Number,
      uvIndex: Number,
      combinedRisk: String,
    },
    recommendations: [String],
    preventiveMeasures: [String],
    outbreakRisk: String,
    mortestimates: {
      prematureDeaths: Number,
      potentialDeathsIfUncontrolled: Number,
      preventableDeaths: Number,
    },
    trend: {
      dayOverDay: String,
      weekOverWeek: String,
      monthOverMonth: String,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

healthImpactSchema.index({ ward: 1, date: -1 });

export default mongoose.model('HealthImpact', healthImpactSchema);
