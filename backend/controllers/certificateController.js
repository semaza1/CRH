const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');

// @desc    Get user's certificates
// @route   GET /api/certificates
// @access  Private
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('course', 'title category instructor')
      .sort({ issuedAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error while fetching certificates' });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public (for verification)
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title description category instructor duration');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Server error while fetching certificate' });
  }
};

// @desc    Verify certificate by ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId 
    })
      .populate('user', 'name')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        message: 'Certificate not found or invalid certificate ID' 
      });
    }

    res.json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateId: certificate.certificateId,
        userName: certificate.user.name,
        courseName: certificate.course.title,
        issuedAt: certificate.issuedAt,
        completionDate: certificate.completionDate
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error while verifying certificate' });
  }
};

// @desc    Generate certificate for completed course
// @route   POST /api/courses/:courseId/certificate
// @access  Private
const generateCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user completed the course
    const progress = await CourseProgress.findOne({
      user: req.user.id,
      course: course._id
    });

    if (!progress || progress.progressPercentage < 100) {
      return res.status(400).json({ 
        message: 'Course not completed yet. Complete all lessons to earn certificate.' 
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: req.user.id,
      course: course._id
    });

    if (certificate) {
      return res.json({
        success: true,
        message: 'Certificate already generated',
        data: certificate
      });
    }

    // Calculate overall score from quiz results
    let overallScore = null;
    if (progress.quizResults.length > 0) {
      const totalScore = progress.quizResults.reduce((sum, qr) => sum + qr.bestScore, 0);
      overallScore = Math.round(totalScore / progress.quizResults.length);
    }

    // Create certificate
    certificate = await Certificate.create({
      user: req.user.id,
      course: course._id,
      completionDate: progress.completedAt || new Date(),
      score: overallScore,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/`
    });

    // Update verification URL with certificate ID
    certificate.verificationUrl = `${certificate.verificationUrl}${certificate.certificateId}`;
    await certificate.save();

    // Update progress
    progress.certificateIssued = true;
    await progress.save();

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error while generating certificate' });
  }
};

// @desc    Download certificate as PDF
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name')
      .populate('course', 'title instructor duration');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Verify ownership
    if (certificate.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }

    // In a real implementation, you would generate a PDF here
    // For now, return certificate data
    // You can use libraries like pdfkit, puppeteer, or an external PDF generation service

    res.json({
      success: true,
      message: 'Certificate ready for download',
      data: certificate,
      note: 'PDF generation to be implemented'
    });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Server error while downloading certificate' });
  }
};

module.exports = {
  getCertificates,
  getCertificate,
  verifyCertificate,
  generateCertificate,
  downloadCertificate
};