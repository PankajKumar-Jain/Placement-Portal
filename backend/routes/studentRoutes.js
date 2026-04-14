const router = require('express').Router();

const {
  getEducationData,
  updateEducationData,
  deletePastEducation,

  getPersonalData,
  updatePersonalData,
  getStudentProfile,

  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,

  addSkill,
  deleteSkill,
  getSkills,
  updateSkill,

  addAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,

  changePassword,
} = require('../controllers/studentDetailsController');

const {
  getJobsForStudent,
  createJobApplication,
  getStudentJobById,
  getApplications,
  getOfferStatus,
  acceptOffer,
  rejectOffer,
} = require('../controllers/studentJobsController');

router.get('/profile', getStudentProfile);

router.get('/personal', getPersonalData);
router.post('/personal', updatePersonalData);

router.post('/education/:update', updateEducationData);
router.delete('/education/:field', deletePastEducation);
router.get('/education', getEducationData);

router.get('/experience/:id', getExperienceById);
router.get('/experience', getExperiences);
router.post('/experience', createExperience);
router.patch('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

router.get('/placement/:id', getPlacementById);
router.post('/placement', createPlacement);
router.get('/placement', getPlacements);
router.patch('/placement/:id', updatePlacement);
router.delete('/placement/:id', deletePlacement);

router.get('/training/:id', getTrainingById);
router.post('/training', createTraining);
router.get('/training', getTrainings);
router.patch('/training/:id', updateTraining);
router.delete('/training/:id', deleteTraining);

router.get('/jobs?', getJobsForStudent);
router.get('/jobs/:jobId', getStudentJobById);
router.post('/jobs/:id/apply', createJobApplication);

router.post('/skills', addSkill);
router.delete('/skills', deleteSkill);
router.get('/skills', getSkills);
router.patch('/skills', updateSkill);

router.post('/achievements', addAchievement);
router.delete('/achievements', deleteAchievement);
router.get('/achievements', getAchievements);
router.patch('/achievements', updateAchievement);

router.post('/change-password', changePassword);

router.get('/applications', getApplications);

router.get('/offer', getOfferStatus);
router.post('/offer/accept', acceptOffer);
router.post('/offer/reject', rejectOffer);

module.exports = router;
