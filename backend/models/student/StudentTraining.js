const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    trainingName: {
      type: String,
      trim: true,
      required: [true, 'Training Name is required!'],
    },

    organisation: {
      type: String,
      trim: true,
      required: [true, 'Training Organisation is required!'],
    },

    certificate: {
      type: String,
      trim: true,
      // required: [true, 'Training Certificate is required!'],
    },

    startDate: {
      type: Date,
      required: [true, 'Training Start Date is required!'],
    },

    endDate: {
      type: Date,
      required: [true, 'Training End Date is required!'],
    },
  },
  { versionKey: false, timestamps: true, collection: 'StudentTrainings' }
);

const TrainingModel = mongoose.model('Training', TrainingSchema);

module.exports = TrainingModel;
