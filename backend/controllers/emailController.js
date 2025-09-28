// controllers/emailController.js
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Update user email preferences
// @route   PUT /api/email/preferences
// @access  Private
const updateEmailPreferences = async (req, res) => {
  try {
    const {
      announcements = true,
      newResources = true,
      applicationUpdates = true,
      emailNotifications = true
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update subscription preferences
    user.subscriptions = {
      announcements,
      newResources,
      applicationUpdates,
      emailNotifications
    };

    await user.save();

    res.json({
      success: true,
      message: 'Email preferences updated successfully',
      preferences: user.subscriptions
    });
  } catch (error) {
    console.error('Update email preferences error:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

// @desc    Get user email preferences
// @route   GET /api/email/preferences
// @access  Private
const getEmailPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      preferences: user.subscriptions || {
        announcements: true,
        newResources: true,
        applicationUpdates: true,
        emailNotifications: true
      }
    });
  } catch (error) {
    console.error('Get email preferences error:', error);
    res.status(500).json({ message: 'Server error while fetching preferences' });
  }
};

// @desc    Send test email to user
// @route   POST /api/email/test
// @access  Private
const sendTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await emailService.sendTestEmail(user.email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ message: 'Server error while sending test email' });
  }
};

// @desc    Unsubscribe user from all emails
// @route   POST /api/email/unsubscribe/:token
// @access  Public
const unsubscribeUser = async (req, res) => {
  try {
    // TODO: Implement unsubscribe token verification
    const { token } = req.params;
    
    // For now, simple implementation
    // In production, you'd decode a JWT token or lookup a unique unsubscribe token
    
    res.json({
      success: true,
      message: 'Unsubscribe functionality will be implemented with token-based system'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error while unsubscribing' });
  }
};

// @desc    Get email statistics (Admin only)
// @route   GET /api/email/stats
// @access  Private/Admin
const getEmailStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    
    const subscriptionStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          announcementsEnabled: {
            $sum: { $cond: [{ $ifNull: ['$subscriptions.announcements', true] }, 1, 0] }
          },
          newResourcesEnabled: {
            $sum: { $cond: [{ $ifNull: ['$subscriptions.newResources', true] }, 1, 0] }
          },
          applicationUpdatesEnabled: {
            $sum: { $cond: [{ $ifNull: ['$subscriptions.applicationUpdates', true] }, 1, 0] }
          },
          emailNotificationsEnabled: {
            $sum: { $cond: [{ $ifNull: ['$subscriptions.emailNotifications', true] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = subscriptionStats[0] || {
      announcementsEnabled: totalUsers,
      newResourcesEnabled: totalUsers,
      applicationUpdatesEnabled: totalUsers,
      emailNotificationsEnabled: totalUsers
    };

    res.json({
      success: true,
      data: {
        totalUsers,
        subscriptions: {
          announcements: {
            enabled: stats.announcementsEnabled,
            disabled: totalUsers - stats.announcementsEnabled,
            percentage: Math.round((stats.announcementsEnabled / totalUsers) * 100)
          },
          newResources: {
            enabled: stats.newResourcesEnabled,
            disabled: totalUsers - stats.newResourcesEnabled,
            percentage: Math.round((stats.newResourcesEnabled / totalUsers) * 100)
          },
          applicationUpdates: {
            enabled: stats.applicationUpdatesEnabled,
            disabled: totalUsers - stats.applicationUpdatesEnabled,
            percentage: Math.round((stats.applicationUpdatesEnabled / totalUsers) * 100)
          },
          emailNotifications: {
            enabled: stats.emailNotificationsEnabled,
            disabled: totalUsers - stats.emailNotificationsEnabled,
            percentage: Math.round((stats.emailNotificationsEnabled / totalUsers) * 100)
          }
        }
      }
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({ message: 'Server error while fetching email statistics' });
  }
};

// @desc    Send bulk email to users (Admin only)
// @route   POST /api/email/bulk
// @access  Private/Admin
const sendBulkEmail = async (req, res) => {
  try {
    const {
      subject,
      content,
      targetUsers = 'all', // 'all', 'active', 'specific'
      userIds = [],
      type = 'announcement'
    } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    let query = { isActive: true };
    
    if (targetUsers === 'specific' && userIds.length > 0) {
      query._id = { $in: userIds };
    }

    const users = await User.find(query);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found with the specified criteria' });
    }

    // Create a mock announcement object for the email
    const announcement = {
      title: subject,
      content,
      type,
      priority: 'medium',
      createdAt: new Date()
    };

    const results = await emailService.sendAnnouncementEmail(users, announcement);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk email sent to ${successCount} users`,
      details: {
        totalUsers: users.length,
        successful: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    console.error('Send bulk email error:', error);
    res.status(500).json({ message: 'Server error while sending bulk email' });
  }
};

module.exports = {
  updateEmailPreferences,
  getEmailPreferences,
  sendTestEmail,
  unsubscribeUser,
  getEmailStats,
  sendBulkEmail
};