const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  archiveResource,
  getResourceStats,
  getFeaturedResources,
  toggleFeatured
} = require('../controllers/resourceController');

// Public routes
router.get('/featured', getFeaturedResources);

// Private routes (authenticated users)
router.use(protect);
router.get('/', getResources);
router.get('/:id', getResource);

// Admin only routes
router.post('/', adminOnly, createResource);
router.put('/:id', adminOnly, updateResource);
router.delete('/:id', adminOnly, deleteResource);
router.put('/:id/archive', adminOnly, archiveResource);
router.put('/:id/featured', adminOnly, toggleFeatured);
router.get('/admin/stats', adminOnly, getResourceStats);

module.exports = router;