require("dotenv").config();

const connectDB = require("../db/connect");

const fs = require("fs/promises");
const path = require("path");

const {
  addStudent,
  addStudentPersonalInfo,
  addStudentEducationInfo,
  getStudentByRollNo,
} = require("./userUtils");
const {
  addBatch,
  getBatchByYear,
  addDepartment,
  getDepartmentByCode,
} = require("./courseUtils");

const defaultCourseId = "64aab7909e25b89756d928ac";
const defaultPassword = "12345678";

(async function () {
  await connectDB(process.env.MONGO_URI);

  const filePath = path.resolve(__dirname, "./StudentData.csv");

  try {
    const content = await fs.readFile(filePath, { encoding: "utf-8" });
    const rows = content.split("\n");
    const data = rows.slice(1);

    console.log(`found ${data.length} students!`);
    let count = 0;

    for (let row of data) {
      const roll_no = row.split(",")[1];
      const studentExists = await getStudentByRollNo(roll_no);
      if (!studentExists) {
        const { basicInfo, personalInfo, educationInfo } = getStudentBody(row);
        console.log(basicInfo, personalInfo, educationInfo);
        const student_id = await setupBasicStudent(basicInfo);
        await addStudentPersonalInfo(personalInfo, student_id);
        await addStudentEducationInfo(educationInfo, student_id);
        count++;
      }
    }
  
    console.log(`added ${count} students!`);
  } catch (error) {
    console.log("error while importing students!", error);
  }
})();

async function setupBasicStudent(basicInfo) {
  const { name, roll_no, email, batchYear, departmentCode } = basicInfo;

  let batchId = await getBatchByYear(batchYear, defaultCourseId);
  if (!batchId) batchId = await addBatch(batchYear, defaultCourseId);

  let departmentId = await getDepartmentByCode(departmentCode, defaultCourseId);
  if (!departmentId)
    departmentId = await addDepartment(departmentCode, defaultCourseId);

  const student_id = await addStudent({
    name,
    roll_no,
    email,
    courseId: defaultCourseId,
    batchId,
    departmentId,
    password: defaultPassword,
  });

  return student_id;
}

function getStudentBody(row) {
  const items = row.split(",");
  let [roll_no, name, email, contactNumber, fatherName] = items.slice(1, 6);
  let [district, address] = items.slice(13, 15);

  roll_no = roll_no.trim();
  name = name.trim();
  email = email.trim().toLowerCase();
  fatherName = fatherName.trim();
  district = district.trim();
  address = address.trim();

  const departmentCode = roll_no.slice(6, 9);
  const is_lateral_entry = roll_no[9] == "9";
  let batchYear = 2000;

  if (is_lateral_entry) batchYear += Number(roll_no.slice(0, 2)) + 3;
  else batchYear += Number(roll_no.slice(0, 2)) + 4;

  const body = {
    basicInfo: { name, email, roll_no, departmentCode, batchYear },
    personalInfo: { fatherName, district, address },
    educationInfo: { is_lateral_entry },
  };

  if (validatePhoneNumber(contactNumber))
    body.personalInfo["contactNumber"] = contactNumber;

  return body;
}

function validatePhoneNumber(phoneNumber) {
  const intPhone = Number(phoneNumber);
  const strPhone = String(intPhone);
  if (strPhone.length != 10) return false;
  return true;
}
