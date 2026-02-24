import Prediction from '../models/Prediction.js';
import Ward from '../models/Ward.js';

export const getPrediction = async (req, res) => {
  try {
    const { wardId } = req.params;

    const prediction = await Prediction.findOne({ ward: wardId })
      .sort({ forecastDate: -1 })
      .populate('ward', 'name currentAQI');

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPrediction = async (req, res) => {
  try {
    const {
      ward,
      wardName,
      forecastDate,
      predictions,
      sourceContribution,
      riskAssessment,
      confidenceScore,
    } = req.body;

    const prediction = await Prediction.create({
      ward,
      wardName,
      forecastDate,
      predictions,
      sourceContribution,
      riskAssessment,
      confidenceScore,
      generatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Prediction created successfully',
      data: prediction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const get48HourPrediction = async (req, res) => {
  try {
    const { wardId } = req.params;

    const prediction = await Prediction.findOne({
      ward: wardId,
      forecastDate: { $gte: new Date() },
    }).sort({ forecastDate: 1 });

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }

    const next48Hours = prediction.predictions.slice(0, 48);

    res.status(200).json({
      success: true,
      ward: prediction.wardName,
      predictions: next48Hours,
      sourceContribution: prediction.sourceContribution,
      confidence: prediction.confidenceScore,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSourceAnalysis = async (req, res) => {
  try {
    const { wardId } = req.params;

    const prediction = await Prediction.findOne({ ward: wardId })
      .sort({ forecastDate: -1 })
      .select('sourceContribution wardName');

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Analysis not available' });
    }

    res.status(200).json({
      success: true,
      ward: prediction.wardName,
      sources: prediction.sourceContribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRiskAssessment = async (req, res) => {
  try {
    const { wardId } = req.params;

    const prediction = await Prediction.findOne({ ward: wardId })
      .sort({ forecastDate: -1 })
      .select('riskAssessment wardName');

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Risk assessment not available' });
    }

    res.status(200).json({
      success: true,
      ward: prediction.wardName,
      risks: prediction.riskAssessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityWidePredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .sort({ forecastDate: -1 })
      .populate('ward', 'name')
      .limit(20);

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
