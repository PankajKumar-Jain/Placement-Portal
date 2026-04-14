const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require('../models/Course');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const createCourse = async (req, res) => {
  const {
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed: rawLateral,
    lateralYearsCount,
    lateralSemestersCount,
  } = req.body;
  const isLateralAllowed = rawLateral === 'on' || rawLateral === true;

  if (isLateralAllowed && (!lateralYearsCount || !lateralSemestersCount))
    throw new CustomAPIError.BadRequestError(
      'Lateral Years & Semesters Count are required'
    );
  else if (!isLateralAllowed && (lateralYearsCount || lateralSemestersCount))
    throw new CustomAPIError.BadRequestError(
      'Lateral Years & Semesters Count can be added only if lateral entry is allowed'
    );

  const course = await CourseModel.create({
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed,
    lateralYearsCount,
    lateralSemestersCount,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Course Created!',
    id: course._id,
  });
};

const updateCourse = async (req, res) => {
  const {
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed: rawLateral,
    lateralYearsCount,
    lateralSemestersCount,
  } = req.body;
  const isLateralAllowed = rawLateral === 'on' || rawLateral === true;

  const courseId = req?.params?.courseId;
  if (!courseId?.trim())
    throw new CustomAPIError.BadRequestError('Course Id is required!');

  if (isLateralAllowed && (!lateralYearsCount || !lateralSemestersCount))
    throw new CustomAPIError.BadRequestError(
      'Lateral Years & Semesters Count are required'
    );
  else if (!isLateralAllowed && (lateralYearsCount || lateralSemestersCount))
    throw new CustomAPIError.BadRequestError(
      'Lateral Years & Semesters Count can be added only if lateral entry is allowed'
    );

  const course = await CourseModel.findByIdAndUpdate(courseId, {
    courseName,
    courseLevel,
    regularYearsCount,
    regularSemestersCount,
    isLateralAllowed,
    lateralYearsCount,
    lateralSemestersCount,
  });

  if (!course)
    throw new CustomAPIError.NotFoundError(
      `No course found with id: ${courseId}`
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Course updated!',
    id: course._id,
  });
};

const getAllCourses = async (req, res) => {
  const courses = await CourseModel.find().select('-batches -departments');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found all courses!',
    courses,
  });
};

const createBatch = async (req, res) => {
  const courseId = req?.params?.courseId;
  const batchYear = req?.body?.batchYear;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  for (let [_, batch] of course.batches) {
    if (batch.batchYear == batchYear)
      throw new CustomAPIError.BadRequestError('This batch already exists!');
  }

  const batch = new BatchModel({ batchYear });
  course.batches.set(batch._id.toString(), batch);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Batch created!',
    id: batch._id,
  });
};

const updateBatch = async (req, res) => {
  const { courseId, batchId } = req?.params;
  const batchYear = req?.body?.batchYear;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `No course found with id: ${courseId}`
    );
  }

  const batch = course.batches.get(batchId);
  if (!batch)
    throw new CustomAPIError.NotFoundError(
      `No batch found with id: ${batchId}`
    );

  for (let [_, batch] of course.batches) {
    if (batch._id.toString === batchId) continue;
    if (batch.batchYear == batchYear)
      throw new CustomAPIError.BadRequestError('This batch already exists!');
  }

  batch.batchYear = batchYear;
  await course.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Batch updated!',
    id: batch._id,
  });
};

const getBatches = async (req, res) => {
  const courseId = req?.params?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Found batches for course id: ${courseId}`,
    batches: course.batches,
  });
};

const createDepartment = async (req, res) => {
  const courseId = req?.params?.courseId;
  const { departmentName, departmentCode } = req.body;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${courseId}`
    );
  }

  for (let [_, department] of course.departments) {
    if (department.departmentName === departmentName)
      throw new CustomAPIError.BadRequestError(
        'A department with this name already exists!'
      );
    if (department.departmentCode === departmentCode)
      throw new CustomAPIError.BadRequestError(
        'A department with this code already exists!'
      );
  }

  const department = new DepartmentModel({ departmentName, departmentCode });
  course.departments.set(department._id.toString(), department);
  await course.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Department created!',
    id: department._id,
  });
};

const updateDepartment = async (req, res) => {
  const { courseId, departmentId } = req?.params;
  const { departmentName, departmentCode } = req.body;

  if (!courseId?.trim() || !departmentId?.trim()) {
    throw new CustomAPIError.BadRequestError(
      'Course Id & Department Id are required!'
    );
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `No course found with id: ${courseId}`
    );
  }

  const department = course.departments.get(departmentId);
  if (!department)
    throw new CustomAPIError.NotFoundError(
      `No department found with id: ${departmentId}`
    );

  for (let [_, department] of course.departments) {
    if (department._id.toString() === departmentId) continue;
    if (department.departmentName === departmentName)
      throw new CustomAPIError.BadRequestError(
        'A department with this name already exists!'
      );
    if (department.departmentCode === departmentCode)
      throw new CustomAPIError.BadRequestError(
        'A department with this code already exists!'
      );
  }

  department['departmentName'] = departmentName;
  department['departmentCode'] = departmentCode;
  await course.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Department updated!',
    id: department._id,
  });
};

const getDepartments = async (req, res) => {
  const courseId = req?.params?.courseId;

  if (!courseId?.trim()) {
    throw new CustomAPIError.BadRequestError('Course Id is required!');
  }

  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new CustomAPIError.NotFoundError(
      `Course with id: ${courseId} doesn't exist!`
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Departments batches for course id: ${courseId}`,
    departments: course.departments,
  });
};

const getCourseOptions = async (req, res) => {
  const projections = {
    courseName: 1,
    batches: 1,
    departments: 1,
  };

  const userRole = req.user.role;

  if (userRole === 'admin') {
    projections['courseLevel'] = 1;
    projections['regularYearsCount'] = 1;
    projections['regularSemestersCount'] = 1;
    projections['isLateralAllowed'] = 1;
    projections['lateralYearsCount'] = 1;
    projections['lateralSemestersCount'] = 1;
  }

  const courses = await CourseModel.find().select(projections);

  const options = [];

  courses.forEach((course) => {
    const departments = [];
    const batches = [];

    course.departments.forEach((value, key) => {
      departments.push({
        departmentId: key,
        departmentName: value.departmentName,
        departmentCode: value.departmentCode,
      });
    });

    course.batches.forEach((value, key) => {
      batches.push({
        batchId: key,
        batchYear: value.batchYear,
      });
    });

    options.push({
      ...course._doc,
      courseId: course._id,
      departments,
      batches,
    });
  });

  res.status(StatusCodes.OK).json({
    success: true,
    options,
  });
};

module.exports = {
  createCourse,
  updateCourse,
  getAllCourses,
  createBatch,
  updateBatch,
  getBatches,
  createDepartment,
  updateDepartment,
  getDepartments,
  getCourseOptions,
};
