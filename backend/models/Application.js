const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // References
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Application must belong to a user']
  },
  resource: {
    type: mongoose.Schema.ObjectId,
    ref: 'Resource',
    required: [true, 'Application must be for a resource']
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Application Data
  applicationData: {
    // Cover Letter / Motivation
    coverLetter: {
      type: String,
      required: [true, 'Please provide a cover letter'],
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    
    // Why interested in this opportunity
    motivation: {
      type: String,
      maxlength: [1000, 'Motivation cannot exceed 1000 characters']
    },
    
    // Relevant experience
    experience: {
      type: String,
      maxlength: [1500, 'Experience description cannot exceed 1500 characters']
    },
    
    // Additional information
    additionalInfo: {
      type: String,
      maxlength: [1000, 'Additional information cannot exceed 1000 characters']
    },
    
    // File attachments (URLs to uploaded files)
    resume: {
      type: String, // URL to resume file
      required: [true, 'Resume is required']
    },
    portfolioUrl: {
      type: String,
      maxlength: [200, 'Portfolio URL cannot exceed 200 characters']
    },
    additionalDocuments: [{
      name: String,
      url: String
    }]
  },
  
  // Timeline
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Admin Review
  reviewedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' // Admin who reviewed
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  
  // Admin decision reason
  decisionReason: {
    type: String,
    maxlength: [500, 'Decision reason cannot exceed 500 characters']
  },
  
  // Communication history
  communications: [{
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'status_update', 'document_request'],
      default: 'message'
    }
  }],
  
  // Notifications
  notifications: {
    userNotified: {
      type: Boolean,
      default: false
    },
    adminNotified: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ApplicationSchema.index({ user: 1, status: 1 });
ApplicationSchema.index({ resource: 1, status: 1 });
ApplicationSchema.index({ status: 1, submittedAt: -1 });

// Ensure one application per user per resource
ApplicationSchema.index({ user: 1, resource: 1 }, { unique: true });

// Virtual for application age
ApplicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((Date.now() - this.submittedAt) / (1000 * 60 * 60 * 24)); // in days
});

// Pre-save middleware to update lastUpdated
ApplicationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = Date.now();
  }
  next();
});

// Method to add communication
ApplicationSchema.methods.addCommunication = function(fromUserId, message, type = 'message') {
  this.communications.push({
    from: fromUserId,
    message,
    type,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status with review info
ApplicationSchema.methods.updateStatus = function(newStatus, reviewerId, reviewNotes, decisionReason) {
  this.status = newStatus;
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (reviewNotes) this.reviewNotes = reviewNotes;
  if (decisionReason) this.decisionReason = decisionReason;
  
  // Add status update communication
  this.communications.push({
    from: reviewerId,
    message: `Application status changed to: ${newStatus}`,
    type: 'status_update',
    timestamp: new Date()
  });
  
  return this.save();
};

// Static method to get application statistics
ApplicationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('Application', ApplicationSchema);