const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Application = require('../models/Application');
const Resource = require('../models/Resource');

// @route   GET /api/applications
// @desc    Get user's applications or all applications (admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If not admin, only show user's own applications
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email')
      .populate('resource', 'title type details')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
});

// @route   POST /api/applications
// @desc    Submit new application
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { resourceId, applicationData } = req.body;

    if (!resourceId || !applicationData) {
      return res.status(400).json({ message: 'Please provide resource ID and application data' });
    }

    // Check if resource exists and is active
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.canAcceptApplications || !resource.canAcceptApplications()) {
      return res.status(400).json({ message: 'This resource is not accepting applications' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      user: req.user.id,
      resource: resourceId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this resource' });
    }

    // Create application
    const application = await Application.create({
      user: req.user.id,
      resource: resourceId,
      applicationData,
      status: 'pending',
      submittedAt: new Date()
    });

    // Update resource application count
    resource.currentApplications = (resource.currentApplications || 0) + 1;
    await resource.save();

    // Populate the application for response
    const populatedApplication = await Application.findById(application._id)
      .populate('user', 'name email')
      .populate('resource', 'title type details');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
});

// @route   PUT /api/applications/:id/review
// @desc    Review application (Admin only)
// @access  Private/Admin
router.put('/:id/review', protect, adminOnly, async (req, res) => {
  try {
    const { status, reviewNotes, decisionReason } = req.body;

    if (!status || !['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ 
        message: 'Please provide a valid status (approved, rejected, or under_review)' 
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('user', 'name email')
      .populate('resource', 'title type');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application status
    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    if (reviewNotes) application.reviewNotes = reviewNotes;
    if (decisionReason) application.decisionReason = decisionReason;

    // Add communication entry
    application.communications.push({
      from: req.user.id,
      message: `Application status changed to: ${status}${decisionReason ? `. Reason: ${decisionReason}` : ''}`,
      type: 'status_update',
      timestamp: new Date()
    });

    await application.save();

    // Send email notification (async)
    if (application.user.subscriptions?.applicationUpdates !== false) {
      emailService.sendApplicationStatusEmail(application, status, reviewNotes).catch(error => {
        console.error('Failed to send application status email:', error);
      });
    }
    
    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });
  } catch (error) {
    console.error('Review application error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid application ID' });
    }
    
    res.status(500).json({ message: 'Server error while reviewing application' });
  }
});

// @route   GET /api/applications/stats
// @desc    Get application statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array to object
    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const monthlyApplications = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const applicationsByResource = await Application.aggregate([
      {
        $lookup: {
          from: 'resources',
          localField: 'resource',
          foreignField: '_id',
          as: 'resourceInfo'
        }
      },
      {
        $unwind: '$resourceInfo'
      },
      {
        $group: {
          _id: '$resourceInfo.title',
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: Object.values(statusStats).reduce((a, b) => a + b, 0),
          pending: statusStats.pending || 0,
          approved: statusStats.approved || 0,
          rejected: statusStats.rejected || 0,
          under_review: statusStats.under_review || 0
        },
        monthlyApplications,
        byResource: applicationsByResource
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: 'Server error while fetching application statistics' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email profile')
      .populate('resource', 'title type details requirements')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user can view this application
    if (req.user.role !== 'admin' && application.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid application ID' });
    }
    
    res.status(500).json({ message: 'Server error while fetching application' });
  }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application (User only)
// @access  Private
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application
    if (application.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if application can be withdrawn
    if (application.status === 'approved' || application.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot withdraw application that has already been processed' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid application ID' });
    }
    
    res.status(500).json({ message: 'Server error while withdrawing application' });
  }
});

module.exports = router;