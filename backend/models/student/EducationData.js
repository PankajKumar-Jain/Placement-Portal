const mongoose = require('mongoose');

const PastScoreSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },

    scale: {
      type: String,
      enum: ['percentage', 'GPA'],
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      validate: {
        validator: function (value) {
          if (this.scale === 'GPA' && value > 10) return false;
          return true;
        },
        message: 'Maximum value exceeded for GPA',
      },
    },

    institute: {
      type: String,
      trim: true,
      required: true,
    },

    board: {
      type: String,
      trim: true,
      required: true,
    },

    stream: {
      type: String,
      trim: true,
    },
  },
  { versionKey: false, _id: false }
);

const SemesterScoreSchema = new mongoose.Schema(
  {
    gpa: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },

    backsCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { versionKey: false, _id: false }
);

const CurrentScoreSchema = new mongoose.Schema(
  {
    semestersCount: {
      type: Number,
      required: true,
    },

    scores: {
      type: [SemesterScoreSchema],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= this.semestersCount;
        },
        message: `Extra semester scores provided!`,
      },
    },

    aggregateGPA: {
      type: Number,
      min: 0,
      max: 10,
      validate: {
        validator: function (value) {
          if (value == null || value === '') return true;
          return value >= 0 && value <= 10;
        },
        message: 'Aggregate GPA must be a number between 0 and 10',
      },
    },
  },
  { versionKey: false, _id: false }
);

const EducationDataSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },

    isLateralEntry: {
      type: Boolean,
      default: false,
    },

    courseLevel: {
      type: String,
      enum: ['graduation', 'postGraduation'],
      default: 'graduation',
    },

    highschool: {
      type: PastScoreSchema,
    },

    intermediate: {
      type: PastScoreSchema,
    },

    diploma: {
      type: PastScoreSchema,
    },

    graduation: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (value) {
          if (this.courseLevel === 'graduation')
            return value instanceof CurrentScoreModel;
          else if (this.courseLevel === 'postGraduation')
            return value instanceof PastScoreModel;
        },
        message: 'Invalid graduation data',
      },
    },

    postGraduation: {
      type: {},
      validate: {
        validator: function (value) {
          if (this.courseLevel === 'postGraduation')
            return value instanceof CurrentScoreModel;
          if (this.courseLevel === 'graduation' && value) return false;
        },
        message: 'Invalid post-graduation data',
      },
    },
  },
  { timestamps: true, versionKey: false, collection: 'StudentEducationData' }
);

const EducationDataModel = mongoose.model(
  'StudentEducationData',
  EducationDataSchema
);

const PastScoreModel = mongoose.model('PastScore', PastScoreSchema);
const CurrentScoreModel = mongoose.model('CurrentScore', CurrentScoreSchema);

module.exports = { EducationDataModel, CurrentScoreModel, PastScoreModel };
