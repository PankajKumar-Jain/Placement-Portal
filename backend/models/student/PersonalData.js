const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true,
      minlength: [3, 'Locality should be of atleast 3 characters'],
      maxlength: [50, 'Locality should be of maximum 50 characters'],
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [3, 'City should be of atleast 3 characters'],
      maxlength: [50, 'City should be of maximum 50 characters'],
    },

    pincode: {
      type: String,
      required: [true, 'PinCode is required'],
      trim: true,
      minlength: [6, 'PinCode should be of 6 characters'],
      maxlength: [6, 'PinCode should be of 6 characters'],
    },

    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      minlength: [3, 'District should be of atleast 3 characters'],
      maxlength: [50, 'District should be of maximum 50 characters'],
    },

    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      minlength: [3, 'State should be of atleast 3 characters'],
      maxlength: [50, 'State should be of maximum 50 characters'],
    },
  },
  { versionKey: false }
);

const PersonalDataSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },

    fatherName: {
      type: String,
      required: [true, "Father's Name is required"],
      trim: true,
      minlength: [3, "Father's Name should be of atleast 3 characters"],
      maxlength: [50, "Father's Name should be of maximum 50 characters"],
    },

    motherName: {
      type: String,
      required: [true, "Mother's Name is required"],
      trim: true,
      minlength: [3, "Mother's Name should be of atleast 3 characters"],
      maxlength: [50, "Mother's Name should be of maximum 50 characters"],
    },

    contactNumber: {
      type: String,
      required: [true, 'Contact Number is required'],
      trim: true,
      unique: true,
    },

    address: {
      type: AddressSchema,
      required: [true, 'Address is required'],
    },
  },
  { versionKey: false, timestamps: true, collection: 'StudentPersonalData' }
);

const PersonalDataModel = mongoose.model(
  'StudentPersonalData',
  PersonalDataSchema
);

module.exports = PersonalDataModel;
