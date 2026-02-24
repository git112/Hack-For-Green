import Report from '../models/Report.js';
import User from '../models/User.js';

export const createReport = async (req, res) => {
  try {
    const { title, description, pollutionType, severity, ward, address, location } = req.body;
    const citizenId = req.user.id;

    const report = await Report.create({
      citizen: citizenId,
      ward,
      wardName: req.body.wardName,
      title,
      description,
      pollutionType,
      severity,
      address,
      location,
      photos: req.body.photos || [],
      timestamp: new Date(),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('citizen', 'name email phoneNumber')
      .populate('assignedTo', 'name employeeId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCitizenReports = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    let query = { citizen: citizenId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('ward', 'name');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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

export const getWardReports = async (req, res) => {
  try {
    const { wardId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    let query = { ward: wardId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('citizen', 'name phoneNumber');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
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

export const updateReportStatus = async (req, res) => {
  try {
    const { status, actionTaken, greenPointsAwarded } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        actionTaken: status === 'resolved' ? actionTaken : undefined,
        resolvedDate: status === 'resolved' ? new Date() : undefined,
        greenPointsAwarded: greenPointsAwarded || 0,
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (greenPointsAwarded && status === 'verified') {
      await User.findByIdAndUpdate(report.citizen, {
        $inc: { greenPoints: greenPointsAwarded },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignReport = async (req, res) => {
  try {
    const { officerId, dueDate } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: officerId,
        status: 'assigned',
        assignedDate: new Date(),
        dueDate,
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Report assigned successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            userId: req.user.id,
            userName: req.user.name,
            comment,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingReports = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const reports = await Report.find({ status: { $in: ['pending', 'verified'] } })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('citizen', 'name phoneNumber')
      .populate('ward', 'name');

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
