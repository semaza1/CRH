const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Resource Type
  type: {
    type: String,
    required: [true, 'Please specify resource type'],
    enum: ['internship', 'job', 'course', 'mentorship', 'scholarship', 'workshop'],
  },
  
  // Category/Field
  category: {
    type: String,
    required: [true, 'Please add a category'],
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
  },
  
  // Requirements & Qualifications
  requirements: {
    education: {
      type: String,
      maxlength: [500, 'Education requirements cannot exceed 500 characters']
    },
    experience: {
      type: String,
      maxlength: [500, 'Experience requirements cannot exceed 500 characters']
    },
    skills: [{
      type: String,
      maxlength: [50, 'Each skill cannot exceed 50 characters']
    }],
    other: {
      type: String,
      maxlength: [500, 'Other requirements cannot exceed 500 characters']
    }
  },
  
  // Details
  details: {
    company: {
      type: String,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    duration: {
      type: String,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    stipend: {
      type: String,
      maxlength: [50, 'Stipend info cannot exceed 50 characters']
    },
    contactEmail: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid contact email'
      ]
    },
    website: {
      type: String,
      maxlength: [200, 'Website URL cannot exceed 200 characters']
    }
  },
  
  // Dates
  applicationDeadline: {
    type: Date,
    required: [true, 'Please add application deadline']
  },
  startDate: {
    type: Date
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Application Management
  maxApplications: {
    type: Number,
    default: null // null means unlimited
  },
  currentApplications: {
    type: Number,
    default: 0
  },
  
  // Applications for this resource
  applications: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Application'
  }],
  
  // Created by (Admin)
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  // Tags for better search
  tags: [{
    type: String,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true
});

// Index for better search performance
ResourceSchema.index({ type: 1, category: 1, status: 1 });
ResourceSchema.index({ applicationDeadline: 1 });
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for checking if deadline has passed
ResourceSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline < new Date();
});

// Virtual for checking if applications are full
ResourceSchema.virtual('isFull').get(function() {
  return this.maxApplications && this.currentApplications >= this.maxApplications;
});

// Method to check if resource accepts applications
ResourceSchema.methods.canAcceptApplications = function() {
  return this.status === 'active' && !this.isExpired && !this.isFull;
};

// Update status based on deadline
ResourceSchema.pre('save', function(next) {
  if (this.applicationDeadline < new Date()) {
    this.status = 'expired';
  }
  next();
});

// Increment view count
ResourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Resource', ResourceSchema);