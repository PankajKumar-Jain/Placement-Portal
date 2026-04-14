const mongoose = require('mongoose');

const BulletPointSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false, versionKey: false }
);

const ExperienceEntrySchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    positionTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    startMonth: String,
    startYear: String,
    endMonth: String,
    endYear: String,
    isCurrent: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bulletPoints: [BulletPointSchema],
  },
  { _id: true, versionKey: false }
);

const EducationEntrySchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    degree: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    concentration: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    gpa: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    graduationMonth: String,
    graduationYear: String,
    city: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    state: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    relevantCoursework: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    thesis: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: true, versionKey: false }
);

const SchoolEntrySchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    satActs: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    state: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    graduationDate: String,
  },
  { _id: true, versionKey: false }
);

const LeadershipEntrySchema = new mongoose.Schema(
  {
    organization: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    startMonth: String,
    startYear: String,
    endMonth: String,
    endYear: String,
    isCurrent: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    state: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bulletPoints: [BulletPointSchema],
  },
  { _id: true, versionKey: false }
);

const ResumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    header: {
      firstName: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      address: {
        type: String,
        trim: true,
        maxlength: 150,
      },
      city: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      state: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: 10,
      },
      email: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 20,
      },
      linkedIn: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      github: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      leetcode: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },
    education: [EducationEntrySchema],
    studyAbroad: {
      isApplicable: {
        type: Boolean,
        default: false,
      },
      coursework: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      city: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      country: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      monthYear: String,
    },
    school: [SchoolEntrySchema],
    experience: [ExperienceEntrySchema],
    leadership: [LeadershipEntrySchema],
    skills: {
      technical: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      languages: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      laboratory: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    interests: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

ResumeSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

const ResumeModel = mongoose.model('Resume', ResumeSchema);

module.exports = ResumeModel;
