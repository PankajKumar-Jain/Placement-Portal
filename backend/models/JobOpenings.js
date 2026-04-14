const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Company Id is required'],
    },

    name: {
      type: String,
      trim: true,
      required: [true, 'Company Name is required'],
    },

    website: {
      type: String,
      trim: true,
    },
  },
  { versionKey: false, _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Course Id is required'],
    },

    courseName: {
      type: String,
      trim: true,
      required: [true, 'Course Name is required!'],
    },
  },
  { versionKey: false, _id: false }
);

const DepartmentSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Department Id is required'],
    },

    departmentName: {
      type: String,
      trim: true,
      required: [true, 'Department Name is required!'],
    },
  },
  { versionKey: false, _id: false }
);

const BatchSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Batch Id is required'],
    },

    batchYear: {
      type: Number,
      required: [true, 'Batch Year is required!'],
    },
  },
  { versionKey: false, _id: false }
);

const JobPosterSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Job Poster Id is required'],
    },

    name: {
      type: String,
      required: [true, 'Job Poster Name is required'],
      trim: true,
    },
  },
  { versionKey: false, _id: false }
);

const EligibilityCriteriaSchema = new mongoose.Schema(
  {
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },

    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },

    diplomaPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },

    graduationPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },

    graduationCGPA: {
      type: Number,
      min: 0,
      max: 10,
      required: false,
    },

    maxActiveBacklogs: {
      type: Number,
      min: 0,
      required: false,
    },

    maxCompletedBacklogs: {
      type: Number,
      min: 0,
      required: false,
    },

    maxDOB: {
      type: Date,
      required: false,
    },
  },
  { versionKey: false, _id: false }
);

const JobOpeningSchema = new mongoose.Schema(
  {
    profile: {
      type: String,
      required: [true, 'Job Profile is required'],
      trim: true,
      minlength: [3, 'Job Profile should be of atleast 3 characters'],
      maxlength: [50, 'Job Profile should be of maximum 50 characters'],
    },

    description: {
      type: String,
      required: [true, 'Job Description is required'],
      trim: true,
    },

    openingsCount: {
      type: Number,
      required: [true, 'Opening Count is required'],
      default: 1,
      min: 1,
    },

    location: {
      type: String,
      required: [true, 'Job Location is required'],
      trim: true,
    },

    company: {
      type: CompanySchema,
      required: [true, 'Company is required!'],
    },

    jobPackage: {
      type: Number,
      required: [true, 'Job Package (in LPA) is required'],
    },

    keySkills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          if (!skills || !skills.length) return false;
          for (let skill of skills) {
            if (!skill?.trim()) return false;
          }
          return true;
        },
        message: "Skill can't be empty",
      },
    },

    deadline: {
      type: Date,
      required: [true, 'Job Application Deadline is required!'],
    },

    cgpaCutoff: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
    },

    enableEligibilityFilter: {
      type: Boolean,
      default: false,
    },

    eligibilityCriteria: {
      type: EligibilityCriteriaSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },

    applicants: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    shortlistedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    rejectedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    selectedCandidates: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'User',
    },

    applications: {
      type: [mongoose.Types.ObjectId],
      default: [],
      ref: 'JobApplication',
    },

    receivingCourse: {
      type: CourseSchema,
      required: [true, 'Receving Course is required!'],
    },

    receivingBatch: {
      type: BatchSchema,
      required: [true, 'Receving Batch is required!'],
    },

    receivingDepartments: {
      type: [DepartmentSchema],
      required: [true, 'Receving Department is required!'],
    },

    postedBy: {
      type: JobPosterSchema,
      required: [true, 'Job Poster is required!'],
    },
  },
  { timestamps: true, versionKey: false }
);

JobOpeningSchema.pre('save', async function () {
  if (!this.isModified('selectedCandidates')) return;
  if (this.selectedCandidates.length === this.openingsCount) {
    this.status = 'closed';
  }
});

const JobOpeningModel = mongoose.model('JobOpening', JobOpeningSchema);

module.exports = JobOpeningModel;
