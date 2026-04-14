const router = require('express').Router();
const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  createJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
  updateJobOpening,
  deleteJobOpening,
  createOnCampusPlacement,
  getStudentPublicProfile,
  getSingleJob,
  getSingleJobApplications,
  uploadOfferLetter,
  getOfferDetails,
} = require('../controllers/companyController');

router.post('/jobs', authorizeRoles('company_admin'), createJobOpening);
router.patch('/jobs/:jobId', authorizeRoles('company_admin'), updateJobOpening);
router.delete(
  '/jobs/:jobId',
  authorizeRoles('company_admin'),
  deleteJobOpening
);
router.get('/jobs', authorizeRoles('company_admin'), getJobsForIncharge);
router.get('/jobs/:jobId', authorizeRoles('company_admin'), getSingleJob);
router.get(
  '/jobs/:jobId/applications',
  authorizeRoles('company_admin'),
  getSingleJobApplications
);

router.get(
  '/applications',
  authorizeRoles('company_admin'),
  getJobApplications
);

router.get(
  '/applications/:applicationId/students/:studentId',
  authorizeRoles('company_admin'),
  getStudentPublicProfile
);

router.patch(
  '/applications/:id/action/:action',
  authorizeRoles('company_admin'),
  jobApplicationAction
);

router.post(
  '/applications/:id/placement',
  authorizeRoles('company_admin'),
  createOnCampusPlacement
);

router.post(
  '/applications/:applicationId/offer-letter',
  authorizeRoles('company_admin'),
  uploadOfferLetter
);

router.get(
  '/applications/:applicationId/offer',
  authorizeRoles('company_admin'),
  getOfferDetails
);

module.exports = router;
