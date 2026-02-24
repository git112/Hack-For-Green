import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide ward name'],
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    city: String,
    area: Number,
    population: Number,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    boundaries: {
      type: String,
    },
    currentAQI: {
      type: Number,
      default: 0,
    },
    aqiLevel: {
      type: String,
      enum: ['Good', 'Satisfactory', 'Moderately Polluted', 'Poor', 'Very Poor', 'Severe'],
      default: 'Good',
    },
    pollutants: {
      pm25: Number,
      pm10: Number,
      o3: Number,
      no2: Number,
      so2: Number,
      co: Number,
    },
    trafficZones: [String],
    constructionZones: [String],
    residentialAreas: [String],
    safeZones: [String],
    unsafeZones: [String],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

wardSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('Ward', wardSchema);
