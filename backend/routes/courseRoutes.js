const router = require('express').Router();

const { authorizeRoles } = require('../middleware/authentication-middleware');

const {
  createCourse,
  getAllCourses,
  createBatch,
  getBatches,
  createDepartment,
  getDepartments,
  getCourseOptions,
  updateCourse,
  updateDepartment,
  updateBatch,
} = require('../controllers/courseController');

router.post('/', authorizeRoles('admin'), createCourse);
router.get('/', authorizeRoles('admin'), getAllCourses);
router.patch('/:courseId', authorizeRoles('admin'), updateCourse);
router.get(
  '/options',
  authorizeRoles('admin', 'company_admin'),
  getCourseOptions
);

router.post('/:courseId/batches', authorizeRoles('admin'), createBatch);
router.get('/:courseId/batches', authorizeRoles('admin'), getBatches);
router.patch(
  '/:courseId/batches/:batchId',
  authorizeRoles('admin'),
  updateBatch
);

router.post(
  '/:courseId/departments',
  authorizeRoles('admin'),
  createDepartment
);
router.patch(
  '/:courseId/departments/:departmentId',
  authorizeRoles('admin'),
  updateDepartment
);
router.get('/:courseId/departments', authorizeRoles('admin'), getDepartments);

module.exports = router;
