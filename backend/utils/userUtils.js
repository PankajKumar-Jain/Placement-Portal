require("dotenv").config();
const connectDB = require("../db/connect");

const UserModel = require("../models/User");
// const StudentPersonalDataModel = require("../models/StudentPersonalData");
// const StudentEducationDataModel = require("../models/StudentEducationData");

const addAdmin = async (adminInfo) => {
  await connectDB(process.env.MONGO_URI);
  const admin = await UserModel.create({ ...adminInfo, role: "admin" });
  console.log("Admin created!", admin._id);
};

addAdmin({
  name: "Admin",
  email: "admin@gmail.com",
  password: "secret_pass",
});

const addStudent = async (studentInfo) => {
  const { name, roll_no, email, courseId, batchId, departmentId, password } =
    studentInfo;

  const student = await UserModel.create({
    name,
    roll_no,
    email,
    password,
    courseId,
    batchId,
    departmentId,
  });

  return student._id;
};

// addStudent({
//   name: "Tushar",
//   roll_no: "2204220109038",
//   email: "metusharjain@gmail.com",
//   courseId: "64aab7909e25b89756d928ac",
//   batchId: "64aabdfb2f838ceddf4052a7",
//   departmentId: "64aab7ade679a10051ce4449",
//   password: "12345678",
// });

const getStudentByRollNo = async (roll_no) => {
  const student = await UserModel.findOne({ roll_no });
  return student;
};

const addStudentPersonalInfo = async (personalInfo, student_id) => {
  // await connectDB(process.env.MONGO_URI);
  const studentPersonal = await StudentPersonalDataModel.create({
    ...personalInfo,
    student_id,
  });

  await UserModel.findByIdAndUpdate(student_id, {
    personal_details: studentPersonal._id,
  });
};

// addStudentPersonalInfo(
//   {
//     fatherName: "Mr. Ajay Kumar Jain",
//     motherName: "Mrs. Rachna Jain",
//     contactNumber: "8604446338",
//     address: "Subhash Nagar, Mahmudabad",
//     district: "Sitapur",
//     state: "Uttar Pradesh",
//   },
//   "64aabe7d44918790f16406ae"
// );

const addStudentEducationInfo = async (educationInfo, student_id) => {
  // await connectDB(process.env.MONGO_URI);
  const studentEducation = await StudentEducationDataModel.create({
    ...educationInfo,
    student_id,
  });

  await UserModel.findByIdAndUpdate(student_id, {
    education_details: studentEducation._id,
  });
};

// addStudentEducationInfo({
//   is_lateral_entry: true,
//   highschool_year: 2017,
//   highschool_score: 89.17,
//   highschool_board: "U.P. Board",
//   diploma_year: 2022,
//   diploma_score: 84.6,
//   diploma_board: "BTEUP"
// }, "64aabe7d44918790f16406ae")

module.exports = {
  addStudent,
  addStudentPersonalInfo,
  addStudentEducationInfo,
  getStudentByRollNo,
};
