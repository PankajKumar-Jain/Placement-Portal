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
const {
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  previewStudentsImport,
  confirmStudentsImport,
  exportStudentsCsv,
  downloadSampleStudentCsv,
} = require('../controllers/adminImportSettingsController');

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

router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);
router.post('/settings/change-password', changeAdminPassword);

router.get('/students/import/sample', downloadSampleStudentCsv);
router.post('/students/import/preview', previewStudentsImport);
router.post('/students/import/confirm', confirmStudentsImport);
router.get('/students/export', exportStudentsCsv);

module.exports = router;
