const Announcement = require('../models/Announcement');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Get announcements for user
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // For now, get all announcements since we don't have the getActiveForUser method yet
    const announcements = await Announcement.find({
      status: 'published',
      $or: [
        { 'targetAudience.roles': { $size: 0 } },
        { 'targetAudience.roles': req.user.role },
        { 'targetAudience.specificUsers': req.user._id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('relatedResource', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit * page);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error while fetching announcements' });
  }
};

// @desc    Get all announcements (Admin only)
// @route   GET /api/announcements/admin/all
// @access  Private/Admin
const getAllAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .populate('relatedResource', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      count: announcements.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: announcements
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({ message: 'Server error while fetching announcements' });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedResource', 'title type');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    res.status(500).json({ message: 'Server error while fetching announcement' });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      relatedResource,
      expiresAt,
      publishedAt
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Please provide title and content' 
      });
    }

    // If expires at is provided, ensure it's in the future
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ 
        message: 'Expiry date must be in the future' 
      });
    }

    const announcementData = {
      title,
      content,
      type: type || 'general',
      priority: priority || 'medium',
      targetAudience: targetAudience || { roles: ['user'], categories: [] },
      relatedResource,
      expiresAt,
      createdBy: req.user.id,
      status: 'published'
    };

    // Set published date
    if (publishedAt && new Date(publishedAt) > new Date()) {
      announcementData.status = 'draft';
      announcementData.publishedAt = publishedAt;
    } else {
      announcementData.publishedAt = new Date();
    }

    const announcement = await Announcement.create(announcementData);

    // Send email notifications if requested and announcement is published
    if (sendEmail && announcement.status === 'published') {
      sendAnnouncementEmails(announcement).catch(error => {
        console.error('Failed to send announcement emails:', error);
      });
    }
    
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email')
      .populate('relatedResource', 'title type');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while creating announcement' });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // If expires at is provided, ensure it's in the future
    if (req.body.expiresAt && new Date(req.body.expiresAt) <= new Date()) {
      return res.status(400).json({ 
        message: 'Expiry date must be in the future' 
      });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('relatedResource', 'title type');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while updating announcement' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    res.status(500).json({ message: 'Server error while deleting announcement' });
  }
};

// @desc    Archive announcement
// @route   PUT /api/announcements/:id/archive
// @access  Private/Admin
const archiveAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.status = 'archived';
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement archived successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Archive announcement error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    res.status(500).json({ message: 'Server error while archiving announcement' });
  }
};

// @desc    Get announcement statistics
// @route   GET /api/announcements/admin/stats
// @access  Private/Admin
const getAnnouncementStats = async (req, res) => {
  try {
    const stats = await Announcement.aggregate([
      {
        $group: {
          _id: null,
          totalAnnouncements: { $sum: 1 },
          publishedAnnouncements: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftAnnouncements: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archivedAnnouncements: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const typeStats = await Announcement.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          views: { $sum: '$views' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalAnnouncements: 0,
          publishedAnnouncements: 0,
          draftAnnouncements: 0,
          archivedAnnouncements: 0,
          totalViews: 0
        },
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({ message: 'Server error while fetching announcement statistics' });
  }
};

// @desc    Get unread announcements count
// @route   GET /api/announcements/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Announcement.countDocuments({
      status: 'published',
      $or: [
        { 'targetAudience.roles': { $size: 0 } },
        { 'targetAudience.roles': req.user.role }
      ]
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
};

// @desc    Mark announcement as read
// @route   PUT /api/announcements/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid announcement ID' });
    }
    
    res.status(500).json({ message: 'Server error while marking announcement as read' });
  }
};

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  getAnnouncementStats,
  getUnreadCount,
  markAsRead
};