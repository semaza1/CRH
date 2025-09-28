const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include in queries by default
  },
  
  // Role & Status
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Google OAuth
  googleId: {
    type: String,
    sparse: true
  },
  
  // Profile Information
  profile: {
    phone: {
      type: String,
      maxlength: [15, 'Phone number cannot exceed 15 characters']
    },
    education: {
      type: String,
      maxlength: [100, 'Education cannot exceed 100 characters']
    },
    skills: [{
      type: String,
      maxlength: [50, 'Each skill cannot exceed 50 characters']
    }],
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    resume: {
      type: String // URL to uploaded resume
    },
    profilePicture: {
      type: String // URL to profile picture
    }
  },
  
  // Application History
  applications: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Application'
  }],
  
  // Subscription Preferences
  subscriptions: {
    announcements: {
      type: Boolean,
      default: true
    },
    newResources: {
      type: Boolean,
      default: true
    },
    applicationUpdates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get user public profile
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  return userObject;
};



module.exports = mongoose.model('User', UserSchema);