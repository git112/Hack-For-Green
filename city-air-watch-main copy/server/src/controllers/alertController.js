import Alert from '../models/Alert.js';

export const createAlert = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      wards,
      targetGroups,
      recommendations,
      healthImpact,
      sentVia,
      startTime,
      endTime,
    } = req.body;

    const alert = await Alert.create({
      title,
      description,
      type,
      severity,
      wards,
      targetGroups,
      recommendations,
      healthImpact,
      status: 'active',
      createdBy: req.user.id,
      sentVia,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveAlerts = async (req, res) => {
  try {
    const { wardId } = req.query;

    let query = { status: 'active' };
    if (wardId) {
      query.wards = wardId;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .populate('wards', 'name')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('wards', 'name')
      .populate('createdBy', 'name');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const { status, description, recommendations } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status,
        description: description || undefined,
        recommendations: recommendations || undefined,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardAlerts = async (req, res) => {
  try {
    const { wardId } = req.params;

    const alerts = await Alert.find({
      wards: wardId,
      status: { $in: ['active', 'resolved'] },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
