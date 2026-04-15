const mongoose = require('mongoose');

const AdminSettingsSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      default: 'global',
      unique: true,
      immutable: true,
    },
    uploadLimit: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000,
    },
    dobPasswordEnabled: {
      type: Boolean,
      default: true,
    },
    forcePasswordResetOnFirstLogin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const AdminSettingsModel = mongoose.model('AdminSettings', AdminSettingsSchema);

module.exports = AdminSettingsModel;
