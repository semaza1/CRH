const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  
  // Announcement Type
  type: {
    type: String,
    enum: ['general', 'new_resource', 'deadline_reminder', 'system_update', 'event'],
    default: 'general'
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Visibility & Targeting
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Target audience
  targetAudience: {
    roles: [{
      type: String,
      enum: ['user', 'admin']
    }],
    categories: [{
      type: String,
      enum: [
        'technology',
        'business',
        'healthcare',
        'education',
        'marketing',
        'design',
        'engineering',
        'finance',
        'other'
      ]
    }],
    specificUsers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Scheduling
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  
  // Related Resource (if announcement is about a specific resource)
  relatedResource: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resource'
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Announcement must have a creator']
  },
  
  // Engagement Tracking
  views: {
    type: Number,
    default: 0
  },
  
  // Users who have read this announcement
  readBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Email notification status
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  
  // Attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['document', 'image', 'link'],
      default: 'document'
    }
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
AnnouncementSchema.index({ status: 1, publishedAt: -1 });
AnnouncementSchema.index({ type: 1, priority: 1 });
AnnouncementSchema.index({ 'targetAudience.roles': 1 });
AnnouncementSchema.index({ expiresAt: 1 });
AnnouncementSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for checking if announcement is active
AnnouncementSchema.virtual('isActive').get(function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    (!this.publishedAt || this.publishedAt <= now) &&
    (!this.expiresAt || this.expiresAt > now)
  );
});

// Virtual for read count
AnnouncementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Method to check if user can see this announcement
AnnouncementSchema.methods.canUserView = function(user) {
  if (!this.isActive) return false;
  if (!this.isPublic) return false;
  
  // Check role targeting
  if (this.targetAudience.roles && this.targetAudience.roles.length > 0) {
    if (!this.targetAudience.roles.includes(user.role)) {
      return false;
    }
  }
  
  // Check specific user targeting
  if (this.targetAudience.specificUsers && this.targetAudience.specificUsers.length > 0) {
    if (!this.targetAudience.specificUsers.includes(user._id)) {
      return false;
    }
  }
  
  return true;
};

// Method to mark as read by user
AnnouncementSchema.methods.markAsRead = function(userId) {
  // Check if user already read it
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to increment views
AnnouncementSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get active announcements for user
AnnouncementSchema.statics.getActiveForUser = async function(user, limit = 10) {
  const now = new Date();
  
  return this.find({
    status: 'published',
    isPublic: true,
    $or: [
      { publishedAt: { $exists: false } },
      { publishedAt: { $lte: now } }
    ],
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } }
    ],
    $or: [
      { 'targetAudience.roles': { $size: 0 } },
      { 'targetAudience.roles': user.role },
      { 'targetAudience.specificUsers': user._id }
    ]
  })
  .populate('createdBy', 'name')
  .populate('relatedResource', 'title type')
  .sort({ priority: -1, publishedAt: -1 })
  .limit(limit);
};

// Pre-save middleware to set publishedAt when status changes to published
AnnouncementSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);