import Ward from '../models/Ward.js';
import AQIData from '../models/AQIData.js';

export const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardById = async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);

    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    res.status(200).json({
      success: true,
      data: ward,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardByName = async (req, res) => {
  try {
    const { name } = req.params;
    const ward = await Ward.findOne({ name });

    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    res.status(200).json({
      success: true,
      data: ward,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardAQI = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { hours = 24 } = req.query;

    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000);

    const aqiData = await AQIData.find({
      ward: wardId,
      timestamp: { $gte: timeLimit },
    })
      .sort({ timestamp: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      ward: ward.name,
      currentAQI: ward.currentAQI,
      aqiLevel: ward.aqiLevel,
      data: aqiData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardMap = async (req, res) => {
  try {
    const wards = await Ward.find().select('name currentAQI aqiLevel coordinates');

    const mapData = wards.map(ward => ({
      id: ward._id,
      name: ward.name,
      aqi: ward.currentAQI,
      level: ward.aqiLevel,
      coordinates: ward.coordinates.coordinates,
    }));

    res.status(200).json({
      success: true,
      data: mapData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbyWards = async (req, res) => {
  try {
    const { longitude, latitude, distance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Coordinates are required' });
    }

    const wards = await Ward.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(distance),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWard = async (req, res) => {
  try {
    const ward = await Ward.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Ward created successfully',
      data: ward,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWard = async (req, res) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Ward updated successfully',
      data: ward,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
