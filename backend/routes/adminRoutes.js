const router = require('express').Router();

const {
  getStudents,
  addCompany,
  addCompanyAdmin,
  addSingleStudent,
  updateSingleStudent,
  deleteSingleStudent,
  blockStudent,
  unblockStudent,
  deleteCompany,
  getCompanies,
  getSingleCompany,
  updateCompany,
  getAdminStats,
} = require('../controllers/adminController');

router.get('/stats', getAdminStats);
router.get('/students', getStudents);
router.post('/students/single', addSingleStudent);
router.patch('/students/single/:id', updateSingleStudent);
router.delete('/students/single/:id', deleteSingleStudent);
router.patch('/students/single/:id/block', blockStudent);
router.patch('/students/single/:id/unblock', unblockStudent);

router.post('/companies', addCompany);
router.get('/companies', getCompanies);
router.delete('/companies/:companyId', deleteCompany);
router.post('/companies/:companyId/admins', addCompanyAdmin);
router.get('/companies/:companyId', getSingleCompany);
router.patch('/companies/:companyId', updateCompany);

module.exports = router;
