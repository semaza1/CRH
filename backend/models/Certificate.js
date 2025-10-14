const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  score: {
    type: Number // Overall course score
  },
  verificationUrl: {
    type: String
  },
  pdfUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique certificate ID before saving
CertificateSchema.pre('save', async function(next) {
  if (!this.certificateId) {
    this.certificateId = `CRH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);