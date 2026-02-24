import AQIData from '../models/AQIData.js';
import Ward from '../models/Ward.js';

export const getCurrentAQI = async (req, res) => {
  try {
    const { wardId } = req.params;

    const latestAQI = await AQIData.findOne({ ward: wardId })
      .sort({ timestamp: -1 })
      .populate('ward', 'name');

    if (!latestAQI) {
      return res.status(404).json({ success: false, message: 'AQI data not found' });
    }

    res.status(200).json({
      success: true,
      data: latestAQI,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAQIHistory = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { startDate, endDate, interval = 'hourly' } = req.query;

    let query = { ward: wardId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    } else {
      const days = interval === 'daily' ? 30 : 7;
      query.timestamp = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    const aqiData = await AQIData.find(query)
      .sort({ timestamp: -1 })
      .populate('ward', 'name');

    res.status(200).json({
      success: true,
      data: aqiData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityAQI = async (req, res) => {
  try {
    const latestAQIData = await AQIData.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$ward',
          aqi: { $first: '$aqi' },
          aqiLevel: { $first: '$aqiLevel' },
          timestamp: { $first: '$timestamp' },
          pm25: { $first: '$pollutants.pm25' },
          pm10: { $first: '$pollutants.pm10' },
        },
      },
      {
        $lookup: {
          from: 'wards',
          localField: '_id',
          foreignField: '_id',
          as: 'ward',
        },
      },
    ]);

    const averageAQI =
      latestAQIData.reduce((sum, data) => sum + data.aqi, 0) / latestAQIData.length || 0;

    const aqiLevel =
      averageAQI <= 50
        ? 'Good'
        : averageAQI <= 100
          ? 'Satisfactory'
          : averageAQI <= 200
            ? 'Moderately Polluted'
            : averageAQI <= 300
              ? 'Poor'
              : averageAQI <= 400
                ? 'Very Poor'
                : 'Severe';

    res.status(200).json({
      success: true,
      cityAQI: {
        average: Math.round(averageAQI),
        level: aqiLevel,
        timestamp: new Date(),
      },
      wards: latestAQIData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordAQIData = async (req, res) => {
  try {
    const { ward, aqi, aqiLevel, pollutants, temperature, humidity, source } = req.body;

    const aqiData = await AQIData.create({
      ward,
      wardName: req.body.wardName,
      aqi,
      aqiLevel,
      pollutants,
      temperature,
      humidity,
      windSpeed: req.body.windSpeed,
      windDirection: req.body.windDirection,
      visibility: req.body.visibility,
      uvIndex: req.body.uvIndex,
      source,
      timestamp: new Date(),
    });

    await Ward.findByIdAndUpdate(ward, {
      currentAQI: aqi,
      aqiLevel,
      pollutants,
      lastUpdated: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'AQI data recorded successfully',
      data: aqiData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAQITrends = async (req, res) => {
  try {
    const { wardId, days = 7 } = req.query;

    const trends = await AQIData.aggregate([
      {
        $match: {
          ward: new (require('mongoose').Types.ObjectId)(wardId),
          timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          avgAQI: { $avg: '$aqi' },
          maxAQI: { $max: '$aqi' },
          minAQI: { $min: '$aqi' },
          avgPM25: { $avg: '$pollutants.pm25' },
          avgPM10: { $avg: '$pollutants.pm10' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
