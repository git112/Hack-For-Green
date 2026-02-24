import PolicySimulation from '../models/PolicySimulation.js';

export const createSimulation = async (req, res) => {
  try {
    const {
      name,
      description,
      ward,
      simulationType,
      parameters,
      baselineAQI,
      predictedAQIReduction,
      costEstimate,
      implementationDays,
      risks,
      benefits,
      impact,
    } = req.body;

    const simulation = await PolicySimulation.create({
      name,
      description,
      ward,
      simulationType,
      parameters,
      baselineAQI,
      predictedAQIReduction,
      costEstimate,
      implementationDays,
      risks,
      benefits,
      impact,
      createdBy: req.user.id,
      status: 'simulated',
    });

    res.status(201).json({
      success: true,
      message: 'Simulation created successfully',
      data: simulation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSimulation = async (req, res) => {
  try {
    const simulation = await PolicySimulation.findById(req.params.id)
      .populate('ward', 'name')
      .populate('createdBy', 'name');

    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    res.status(200).json({
      success: true,
      data: simulation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSimulationsByWard = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { status } = req.query;

    let query = { ward: wardId };
    if (status) query.status = status;

    const simulations = await PolicySimulation.find(query)
      .sort({ createdAt: -1 })
      .populate('ward', 'name');

    res.status(200).json({
      success: true,
      data: simulations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSimulation = async (req, res) => {
  try {
    const { status, actualResults } = req.body;

    const simulation = await PolicySimulation.findByIdAndUpdate(
      req.params.id,
      {
        status,
        actualResults: actualResults || undefined,
      },
      { new: true }
    );

    if (!simulation) {
      return res.status(404).json({ success: false, message: 'Simulation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Simulation updated successfully',
      data: simulation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSimulations = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const simulations = await PolicySimulation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('ward', 'name');

    const total = await PolicySimulation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: simulations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
