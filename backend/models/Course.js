const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
  {
    batchYear: {
      type: Number,
      required: [true, 'Batch Year is required!'],
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },

    lastJobOpening: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false }
);

const DepartmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      trim: true,
      required: [true, 'Department name is required!'],
    },

    departmentCode: {
      type: String,
      trim: true,
      required: [true, 'Department Code is required!'],
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },

    lastJobOpening: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false }
);

const CourseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      trim: true,
      required: [true, 'Course Name is required!'],
      unique: [true, 'Course Name must be unique!'],
    },

    courseLevel: {
      type: String,
      enum: ['graduation', 'postGraduation'],
      required: [true, 'Course Level is required!'],
    },

    regularYearsCount: {
      type: Number,
      min: 1,
      required: [true, 'Course Year Count is required!'],
    },

    regularSemestersCount: {
      type: Number,
      min: 2,
      required: [true, 'Course Semester Count is required!'],
    },

    isLateralAllowed: {
      type: Boolean,
      default: false,
    },

    lateralYearsCount: {
      type: Number,
      min: 1,
      required: function () {
        return this.isLateralAllowed;
      },
    },

    lateralSemestersCount: {
      type: Number,
      min: 1,
      required: function () {
        return this.isLateralAllowed;
      },
    },

    batches: {
      type: Map,
      of: BatchSchema,
      default: new Map(),
    },

    departments: {
      type: Map,
      of: DepartmentSchema,
      default: new Map(),
    },

    lastNoticeTime: {
      type: Date,
      default: new Date(),
    },

    lastJobOpening: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false }
);

/* TODO:
Ensure uniqueness of batches and departments in each course
*/

const CourseModel = mongoose.model('Course', CourseSchema);
const DepartmentModel = mongoose.model('Department', DepartmentSchema);
const BatchModel = mongoose.model('Batches', BatchSchema);

module.exports = { CourseModel, DepartmentModel, BatchModel };
