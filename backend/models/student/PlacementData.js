const mongoose = require('mongoose');

const PlacementDataSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    jobProfile: {
      type: String,
      required: [true, 'Job Profile is required'],
      trim: true,
    },

    company: {
      type: String,
      required: [true, 'Employer company is required'],
      trim: true,
    },

    departmentName: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    package: {
      type: Number,
      required: [true, 'Package Amount is required'],
    },

    offerLetter: {
      type: String,
    },

    joiningLetter: {
      type: String,
    },

    joiningDate: {
      type: Date,
    },

    isOnCampus: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true, collection: 'StudentPlacements' }
);

const PlacementDataModel = mongoose.model(
  'StudentPlacementData',
  PlacementDataSchema
);

module.exports = PlacementDataModel;
