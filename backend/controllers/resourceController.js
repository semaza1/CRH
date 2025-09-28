const Resource = require('../models/Resource');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const emailService = require('../services/emailService');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query object
    let query = {};
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // Default to active resources for regular users
      if (req.user.role !== 'admin') {
        query.status = 'active';
      }
    }
    
    // Text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      count: resources.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error while fetching resources' });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'applications',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    if (resource.incrementViews) {
      await resource.incrementViews();
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    res.status(500).json({ message: 'Server error while fetching resource' });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      requirements,
      details,
      applicationDeadline,
      startDate,
      maxApplications,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !type || !category || !applicationDeadline) {
      return res.status(400).json({ 
        message: 'Please provide title, description, type, category, and application deadline' 
      });
    }

    // Check if deadline is in the future
    if (new Date(applicationDeadline) <= new Date()) {
      return res.status(400).json({ 
        message: 'Application deadline must be in the future' 
      });
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category,
      requirements: requirements || {},
      details: details || {},
      applicationDeadline,
      startDate,
      maxApplications,
      tags: tags || [],
      createdBy: req.user.id
    });

    // Create announcement for new resource
    try {
      await Announcement.create({
        title: `New ${type} Available: ${title}`,
        content: `A new ${type} opportunity has been posted: "${title}". Check it out and apply if interested!`,
        type: 'new_resource',
        priority: 'medium',
        targetAudience: {
          roles: ['user'],
          categories: [category]
        },
        relatedResource: resource._id,
        createdBy: req.user.id,
        status: 'published',
        publishedAt: new Date()
      });
    } catch (announcementError) {
      console.error('Failed to create announcement:', announcementError);
      // Don't fail the resource creation if announcement fails
    }

    // Send email notification to users (async)
    const sendNotifications = async () => {
      try {
        console.log('Fetching users for email notifications...');
        
        // Get users who should be notified about new resources
        const users = await User.find({ 
          role: 'user',
          isActive: true,
          'subscriptions.newResources': true
        }).select('name email subscriptions');
        
        console.log(`Found ${users.length} users for notification`);
        
        if (users && users.length > 0) {
          console.log('Sending emails...');
          const emailResults = await emailService.sendNewResourceEmail(users, resource);
          console.log('Email results:', emailResults.length);
        } else {
          console.log('No users found or opted in for resource notifications');
        }
      } catch (error) {
        console.error('Failed to send resource notification emails:', error);
        console.error('Error details:', error.message);
      }
    };

    // Call the notification function (don't await to not block response)
    sendNotifications();

    const populatedResource = await Resource.findById(resource._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: populatedResource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while creating resource' });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if deadline is in the future (if being updated)
    if (req.body.applicationDeadline && new Date(req.body.applicationDeadline) <= new Date()) {
      return res.status(400).json({ 
        message: 'Application deadline must be in the future' 
      });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while updating resource' });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if resource has applications
    if (resource.currentApplications > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete resource with existing applications. Archive it instead.' 
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    res.status(500).json({ message: 'Server error while deleting resource' });
  }
};

// @desc    Archive/Unarchive resource
// @route   PUT /api/resources/:id/archive
// @access  Private/Admin
const archiveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.status = resource.status === 'active' ? 'inactive' : 'active';
    await resource.save();

    res.json({
      success: true,
      message: `Resource ${resource.status === 'active' ? 'activated' : 'archived'} successfully`,
      data: resource
    });
  } catch (error) {
    console.error('Archive resource error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    res.status(500).json({ message: 'Server error while archiving resource' });
  }
};

// @desc    Get resource statistics (Admin only)
// @route   GET /api/resources/admin/stats
// @access  Private/Admin
const getResourceStats = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: null,
          totalResources: { $sum: 1 },
          activeResources: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveResources: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          expiredResources: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          totalApplications: { $sum: '$currentApplications' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const typeStats = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          applications: { $sum: '$currentApplications' }
        }
      }
    ]);

    const categoryStats = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          applications: { $sum: '$currentApplications' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalResources: 0,
          activeResources: 0,
          inactiveResources: 0,
          expiredResources: 0,
          totalApplications: 0,
          totalViews: 0
        },
        byType: typeStats,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Get resource stats error:', error);
    res.status(500).json({ message: 'Server error while fetching resource statistics' });
  }
};

// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Public
const getFeaturedResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      status: 'active',
      featured: true,
      applicationDeadline: { $gt: new Date() }
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get featured resources error:', error);
    res.status(500).json({ message: 'Server error while fetching featured resources' });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/resources/:id/featured
// @access  Private/Admin
const toggleFeatured = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.featured = !resource.featured;
    await resource.save();

    res.json({
      success: true,
      message: `Resource ${resource.featured ? 'featured' : 'unfeatured'} successfully`,
      data: resource
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    res.status(500).json({ message: 'Server error while toggling featured status' });
  }
};

module.exports = {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  archiveResource,
  getResourceStats,
  getFeaturedResources,
  toggleFeatured
};