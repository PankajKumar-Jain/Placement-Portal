const {
  CourseModel,
  BatchModel,
  DepartmentModel,
} = require("../models/Course");

const { branchMapping } = require("./config");

const addBatch = async (batchYear, courseId) => {
  const course = await CourseModel.findById(courseId);
  if (!course) return null;

  const batch = await BatchModel.create({ courseId, batchYear });

  course.batches.push(batch._id);
  await course.save();

  return batch._id;
};

const getBatchByYear = async (batchYear, courseId) => {
  const batch = await BatchModel.findOne({ batchYear, courseId });
  return batch?._id;
};

const addDepartment = async (departmentCode, courseId) => {
  const course = await CourseModel.findById(courseId);
  if (!course) return null;

  const departmentName = branchMapping[departmentCode];
  if (!departmentName) return null;

  const department = await DepartmentModel.create({
    departmentName,
    courseId,
    departmentCode,
  });

  course.departments.push(department._id);
  await course.save();

  return department._id;
};

const getDepartmentByCode = async (departmentCode, courseId) => {
  const department = await DepartmentModel.findOne({
    departmentCode,
    courseId,
  });
  return department?._id;
};

module.exports = {
  addBatch,
  getBatchByYear,
  addDepartment,
  getDepartmentByCode,
};
