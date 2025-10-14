const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificate,
  verifyCertificate,
  generateCertificate,
  downloadCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.get('/', protect, getCertificates);
router.get('/:id', getCertificate);
router.post('/course/:courseId', protect, generateCertificate);
router.get('/:id/download', protect, downloadCertificate);

module.exports = router;