import mongoose from 'mongoose';

const aqiDataSchema = new mongoose.Schema(
  {
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    wardName: String,
    aqi: {
      type: Number,
      required: true,
    },
    aqiLevel: {
      type: String,
      enum: ['Good', 'Satisfactory', 'Moderately Polluted', 'Poor', 'Very Poor', 'Severe'],
    },
    pollutants: {
      pm25: Number,
      pm10: Number,
      o3: Number,
      no2: Number,
      so2: Number,
      co: Number,
    },
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: String,
    visibility: Number,
    uvIndex: Number,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['OpenWeather', 'WAQI', 'Government', 'Manual'],
      default: 'OpenWeather',
    },
  },
  { timestamps: true }
);

aqiDataSchema.index({ ward: 1, timestamp: -1 });
aqiDataSchema.index({ timestamp: -1 });

export default mongoose.model('AQIData', aqiDataSchema);
