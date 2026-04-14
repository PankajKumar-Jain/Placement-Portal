const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    noticeTitle: {
      type: String,
      trim: true,
      required: [true, "Notice Title is required"],
    },

    noticeBody: {
      type: String,
      trim: true,
      required: [true, "Notice Body is required"],
    },

    noticeFile: {
      type: String,
      trim: true,
    },

    isUrgent: {
      type: Boolean,
      default: false,
    },

    targetType: {
      type: String,
      enum: ['all', 'course', 'branch', 'batch', 'branch_batch'],
      default: 'all',
      trim: true,
    },

    receivingCourse: {
      type: mongoose.Types.ObjectId,
      ref: "Course",
    },

    receivingBatches: {
      type: [mongoose.Types.ObjectId],
      ref: "Batch",
      default: [],
    },

    receivingDepartments: {
      type: [mongoose.Types.ObjectId],
      ref: "Department",
      default: [],
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

const NoticeModel = mongoose.model("Notice", NoticeSchema);

module.exports = NoticeModel;
