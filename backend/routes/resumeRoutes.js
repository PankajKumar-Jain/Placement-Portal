const express = require('express');
const router = express.Router();

const {
  getResume,
  updateResume,
  generatePDF,
} = require('../controllers/resumeController');
const {
  authenticateUser,
  authorizeRoles,
} = require('../middleware/authentication-middleware');

router.get('/resume', authenticateUser, authorizeRoles('student'), getResume);
router.post('/resume', authenticateUser, authorizeRoles('student'), updateResume);
router.get('/resume/download', authenticateUser, authorizeRoles('student'), generatePDF);

module.exports = router;
