require("dotenv").config();
const connectDB = require("../db/connect");

const UserModel = require("../models/User");
const StudentPersonalData = require("../models/StudentPersonalData");

const addPersonalData = async (studentPersonalInfo) => {
  await connectDB(process.env.MONGO_URI);
  try {
    const student_id = studentPersonalInfo.student_id;
    const student = await UserModel.findOne({
      _id: student_id,
      role: "student",
    });

    if (!student) {
      throw new Error(`No student found with id: ${student_id}`);
    }

    const personalData = await StudentPersonalData.create({
      ...studentPersonalInfo,
    });

    student.personal_details = personalData._id;
    await student.save();

    console.log(`Personal details created with id: ${personalData._id}`);
  } catch (error) {
    console.log("Failed to create batch", error);
  }
};

// addPersonalData({
//   student_id: "64a05adb7e56078427c9f75e",
//   fatherName: "Ajay Kumar Jain",
//   motherName: "Rachna Jain",
//   address: "Subhash Nagar",
//   state: "Uttar Pradesh",
//   district: "Sitapur",
//   contactNumber: "8604446338",
// });
