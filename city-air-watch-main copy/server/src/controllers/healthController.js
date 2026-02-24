import HealthImpact from '../models/HealthImpact.js';

export const createHealthImpactData = async (req, res) => {
  try {
    const {
      ward,
      wardName,
      aqiLevel,
      currentAQI,
      respiratoryCases,
      hospitalAdmissions,
      affectedPopulation,
      riskZones,
      heatwaveData,
      recommendations,
      preventiveMeasures,
      outbreakRisk,
      mortestimates,
      trend,
    } = req.body;

    const healthData = await HealthImpact.create({
      ward,
      wardName,
      date: new Date(),
      aqiLevel,
      currentAQI,
      respiratoryCases,
      hospitalAdmissions,
      affectedPopulation,
      riskZones,
      heatwaveData,
      recommendations,
      preventiveMeasures,
      outbreakRisk,
      mortestimates,
      trend,
    });

    res.status(201).json({
      success: true,
      message: 'Health impact data recorded successfully',
      data: healthData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardHealthImpact = async (req, res) => {
  try {
    const { wardId } = req.params;

    const healthData = await HealthImpact.findOne({ ward: wardId })
      .sort({ date: -1 })
      .populate('ward', 'name currentAQI');

    if (!healthData) {
      return res.status(404).json({ success: false, message: 'Health impact data not found' });
    }

    res.status(200).json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityHealthOverview = async (req, res) => {
  try {
    const latestHealthData = await HealthImpact.aggregate([
      {
        $sort: { date: -1 },
      },
      {
        $group: {
          _id: '$ward',
          wardName: { $first: '$wardName' },
          aqiLevel: { $first: '$aqiLevel' },
          currentAQI: { $first: '$currentAQI' },
          respiratoryCases: { $first: '$respiratoryCases.total' },
          affectedChildren: { $first: '$affectedPopulation.children' },
          affectedElderly: { $first: '$affectedPopulation.elderly' },
          riskLevel: { $first: '$outbreakRisk' },
        },
      },
      {
        $limit: 100,
      },
    ]);

    const totalRespiratoryCases = latestHealthData.reduce(
      (sum, data) => sum + (data.respiratoryCases || 0),
      0
    );
    const totalAffectedChildren = latestHealthData.reduce(
      (sum, data) => sum + (data.affectedChildren || 0),
      0
    );
    const totalAffectedElderly = latestHealthData.reduce(
      (sum, data) => sum + (data.affectedElderly || 0),
      0
    );

    res.status(200).json({
      success: true,
      cityOverview: {
        totalRespiratoryCases: totalRespiratoryCases,
        affectedChildren: totalAffectedChildren,
        affectedElderly: totalAffectedElderly,
        highRiskWards: latestHealthData.filter(d => d.riskLevel === 'high').length,
      },
      wardData: latestHealthData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRiskZones = async (req, res) => {
  try {
    const { wardId } = req.params;

    const healthData = await HealthImpact.findOne({ ward: wardId })
      .sort({ date: -1 })
      .select('riskZones wardName');

    if (!healthData) {
      return res.status(404).json({ success: false, message: 'Risk zone data not found' });
    }

    res.status(200).json({
      success: true,
      ward: healthData.wardName,
      riskZones: healthData.riskZones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHealthTrends = async (req, res) => {
  try {
    const { wardId, days = 30 } = req.query;

    const trends = await HealthImpact.find({
      ward: wardId,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    })
      .sort({ date: 1 })
      .select('date currentAQI respiratoryCases hospitalAdmissions');

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHealthRecommendations = async (req, res) => {
  try {
    const { wardId } = req.params;

    const healthData = await HealthImpact.findOne({ ward: wardId })
      .sort({ date: -1 })
      .select('recommendations preventiveMeasures outbreakRisk wardName');

    if (!healthData) {
      return res.status(404).json({ success: false, message: 'Recommendations not available' });
    }

    res.status(200).json({
      success: true,
      ward: healthData.wardName,
      recommendations: healthData.recommendations,
      preventiveMeasures: healthData.preventiveMeasures,
      outbreakRisk: healthData.outbreakRisk,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
