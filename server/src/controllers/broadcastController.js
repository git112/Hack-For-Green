import Broadcast from '../models/Broadcast.js';

export const createBroadcast = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      wards,
      broadcastTo,
      channels,
      scheduledFor,
      priority,
      attachments,
    } = req.body;

    const broadcast = await Broadcast.create({
      title,
      message,
      type,
      wards,
      broadcastTo,
      channels,
      status: scheduledFor ? 'scheduled' : 'sent',
      scheduledFor: scheduledFor || new Date(),
      sentAt: scheduledFor ? null : new Date(),
      createdBy: req.user.id,
      priority,
      attachments,
      recipientCount: 0,
      successCount: 0,
      failureCount: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Broadcast created successfully',
      data: broadcast,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBroadcast = async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id)
      .populate('wards', 'name')
      .populate('createdBy', 'name');

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast not found' });
    }

    res.status(200).json({
      success: true,
      data: broadcast,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBroadcasts = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const broadcasts = await Broadcast.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('wards', 'name');

    const total = await Broadcast.countDocuments(query);

    res.status(200).json({
      success: true,
      data: broadcasts,
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

export const updateBroadcast = async (req, res) => {
  try {
    const { status, successCount, failureCount, recipientCount } = req.body;

    const broadcast = await Broadcast.findByIdAndUpdate(
      req.params.id,
      {
        status,
        successCount: successCount || undefined,
        failureCount: failureCount || undefined,
        recipientCount: recipientCount || undefined,
        sentAt: status === 'sent' ? new Date() : undefined,
      },
      { new: true }
    );

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Broadcast updated successfully',
      data: broadcast,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWardBroadcasts = async (req, res) => {
  try {
    const { wardId } = req.params;

    const broadcasts = await Broadcast.find({
      wards: wardId,
      status: { $in: ['sent', 'scheduled'] },
    })
      .sort({ sentAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: broadcasts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
