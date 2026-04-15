const fs = require('fs/promises');

const validator = require('validator');
const { StatusCodes } = require('http-status-codes');

const CustomAPIError = require('../errors');
const UserModel = require('../models/User');
const AdminSettingsModel = require('../models/AdminSettings');
const { CourseModel } = require('../models/Course');
const { PersonalDataModel } = require('../models/student');
const { createUserToken, attachCookieToResponse } = require('../utils');

const REQUIRED_HEADERS = [
  'name',
  'roll no',
  'email',
  'course',
  'department',
  'batch',
  'dob',
];

const EXPORT_HEADERS = [
  'Name',
  'Roll No',
  'Email',
  'Course',
  'Department',
  'Batch',
  'DOB',
  'Status',
  'Password Reset Required',
];

const getAdminSettingsDoc = async () => {
  const settings = await AdminSettingsModel.findOneAndUpdate(
    { scope: 'global' },
    { $setOnInsert: { scope: 'global' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return settings;
};

const normalizeHeader = (header = '') => header.trim().toLowerCase();

const splitCsvLine = (line = '') => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  values.push(current.trim());
  return values;
};

const parseCsvRows = (csvString = '') => {
  const lines = csvString
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    throw new CustomAPIError.BadRequestError('CSV file is empty');
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length) {
    throw new CustomAPIError.BadRequestError(
      `Missing required CSV headers: ${missingHeaders.join(', ')}`
    );
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    rows.push({
      rowNumber: i + 1,
      raw: row,
    });
  }
  return rows;
};

const parseDob = (dobValue = '') => {
  const normalized = dobValue.trim();
  if (!normalized) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [yyyy, mm, dd] = normalized.split('-').map(Number);
    return buildDob(dd, mm, yyyy);
  }

  const ddmmyyyyMatch = normalized.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, dd, mm, yyyy] = ddmmyyyyMatch;
    return buildDob(Number(dd), Number(mm), Number(yyyy));
  }

  return null;
};

const buildDob = (dd, mm, yyyy) => {
  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (
    date.getUTCFullYear() !== yyyy ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return null;
  }
  return { date, dd, mm, yyyy };
};

const dobToPassword = ({ dd, mm, yyyy }) =>
  `${String(dd).padStart(2, '0')}${String(mm).padStart(2, '0')}${String(
    yyyy
  )}`;

const getCourseLookup = async () => {
  const courses = await CourseModel.find();
  const courseMap = new Map();

  courses.forEach((course) => {
    const key = course.courseName.trim().toLowerCase();
    const departmentMap = new Map();
    const batchMap = new Map();

    for (const [departmentId, department] of course.departments.entries()) {
      departmentMap.set(department.departmentName.trim().toLowerCase(), {
        id: departmentId,
        name: department.departmentName,
      });
    }

    for (const [batchId, batch] of course.batches.entries()) {
      batchMap.set(String(batch.batchYear), {
        id: batchId,
        year: batch.batchYear,
      });
    }

    courseMap.set(key, {
      courseId: course._id.toString(),
      courseName: course.courseName,
      courseLevel: course.courseLevel,
      regularYearsCount: course.regularYearsCount,
      regularSemestersCount: course.regularSemestersCount,
      departmentMap,
      batchMap,
    });
  });

  return courseMap;
};

const validateImportRows = async (rows) => {
  const courseMap = await getCourseLookup();
  const dbDupCandidates = {
    rollNos: new Set(),
    emails: new Set(),
  };

  rows.forEach(({ raw }) => {
    if (raw['roll no']) dbDupCandidates.rollNos.add(raw['roll no'].trim());
    if (raw.email) dbDupCandidates.emails.add(raw.email.trim().toLowerCase());
  });

  const [existingRollNos, existingEmails] = await Promise.all([
    dbDupCandidates.rollNos.size
      ? UserModel.find({ rollNo: { $in: Array.from(dbDupCandidates.rollNos) } })
          .select('rollNo')
          .lean()
      : [],
    dbDupCandidates.emails.size
      ? UserModel.find({
          email: { $in: Array.from(dbDupCandidates.emails) },
        })
          .select('email')
          .lean()
      : [],
  ]);

  const existingRollSet = new Set(existingRollNos.map((u) => u.rollNo));
  const existingEmailSet = new Set(
    existingEmails.map((u) => u.email.toLowerCase())
  );

  const seenRollNos = new Set();
  const seenEmails = new Set();

  const validRows = [];
  const invalidRows = [];

  rows.forEach(({ rowNumber, raw }) => {
    const errors = [];
    const name = raw.name?.trim();
    const rollNo = raw['roll no']?.trim();
    const email = raw.email?.trim().toLowerCase();
    const courseName = raw.course?.trim();
    const departmentName = raw.department?.trim();
    const batch = raw.batch?.trim();
    const dobValue = raw.dob?.trim();

    if (!name || !rollNo || !email || !courseName || !departmentName || !batch || !dobValue) {
      errors.push('Missing required fields');
    }

    if (email && !validator.isEmail(email)) {
      errors.push('Invalid email format');
    }

    const parsedDob = parseDob(dobValue);
    if (!parsedDob) {
      errors.push('Invalid DOB format (supported: DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD)');
    }

    const course = courseMap.get((courseName || '').toLowerCase());
    if (!course) {
      errors.push('Invalid course name');
    }

    const department = course?.departmentMap.get(
      (departmentName || '').toLowerCase()
    );
    if (course && !department) {
      errors.push('Invalid department for selected course');
    }

    const batchData = course?.batchMap.get(String(batch));
    if (course && !batchData) {
      errors.push('Invalid batch year for selected course');
    }

    if (rollNo && seenRollNos.has(rollNo)) errors.push('Duplicate Roll No in CSV');
    if (email && seenEmails.has(email)) errors.push('Duplicate Email in CSV');
    if (rollNo && existingRollSet.has(rollNo)) errors.push('Roll No already exists');
    if (email && existingEmailSet.has(email)) errors.push('Email already exists');

    if (rollNo) seenRollNos.add(rollNo);
    if (email) seenEmails.add(email);

    if (errors.length) {
      invalidRows.push({
        rowNumber,
        row: raw,
        errors,
      });
      return;
    }

    validRows.push({
      rowNumber,
      row: raw,
      mapped: {
        name,
        rollNo,
        email,
        courseId: course.courseId,
        courseName: course.courseName,
        courseLevel: course.courseLevel,
        yearsCount: course.regularYearsCount,
        semestersCount: course.regularSemestersCount,
        departmentId: department.id,
        departmentName: department.name,
        batchId: batchData.id,
        batchYear: batchData.year,
        dob: parsedDob,
      },
    });
  });

  return { validRows, invalidRows };
};

const parseCsvFromRequest = async (req) => {
  let csvFile = req?.files?.file || req?.files?.csvFile;
  if (Array.isArray(csvFile)) csvFile = csvFile[0];
  if (!csvFile) {
    throw new CustomAPIError.BadRequestError('CSV file is required');
  }

  if (!csvFile.name.toLowerCase().endsWith('.csv')) {
    throw new CustomAPIError.BadRequestError('Only .csv file is allowed');
  }

  const csvString = await fs.readFile(csvFile.tempFilePath, 'utf-8');
  return parseCsvRows(csvString);
};

const getAdminSettings = async (req, res) => {
  const settings = await getAdminSettingsDoc();

  res.status(StatusCodes.OK).json({
    success: true,
    settings,
  });
};

const updateAdminSettings = async (req, res) => {
  const existing = await getAdminSettingsDoc();
  const payload = {};

  if (req.body.uploadLimit !== undefined) {
    const limit = Number(req.body.uploadLimit);
    if (Number.isNaN(limit) || limit < 1 || limit > 1000) {
      throw new CustomAPIError.BadRequestError(
        'Upload limit must be between 1 and 1000'
      );
    }
    payload.uploadLimit = limit;
  }

  if (req.body.dobPasswordEnabled !== undefined) {
    payload.dobPasswordEnabled =
      req.body.dobPasswordEnabled === true || req.body.dobPasswordEnabled === 'true';
  }

  if (req.body.forcePasswordResetOnFirstLogin !== undefined) {
    payload.forcePasswordResetOnFirstLogin =
      req.body.forcePasswordResetOnFirstLogin === true ||
      req.body.forcePasswordResetOnFirstLogin === 'true';
  }

  const settings = await AdminSettingsModel.findByIdAndUpdate(existing._id, payload, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Admin settings updated successfully',
    settings,
  });
};

const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new CustomAPIError.BadRequestError('All password fields are required');
  }

  if (newPassword !== confirmPassword) {
    throw new CustomAPIError.BadRequestError('New and confirm password do not match');
  }

  if (newPassword.length < 8) {
    throw new CustomAPIError.BadRequestError(
      'Password must be at least 8 characters long'
    );
  }

  const admin = await UserModel.findById(req.user.userId);
  if (!admin) throw new CustomAPIError.NotFoundError('Admin not found');

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new CustomAPIError.BadRequestError('Current password is incorrect');
  }

  admin.password = newPassword;
  admin.forcePasswordReset = false;
  await admin.save();

  const userToken = createUserToken(admin);
  attachCookieToResponse(res, userToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password changed successfully',
  });
};

const previewStudentsImport = async (req, res) => {
  const settings = await getAdminSettingsDoc();
  const rows = await parseCsvFromRequest(req);

  if (rows.length > settings.uploadLimit) {
    throw new CustomAPIError.BadRequestError(
      `Upload limit exceeded. Max allowed rows: ${settings.uploadLimit}`
    );
  }

  const { validRows, invalidRows } = await validateImportRows(rows);

  res.status(StatusCodes.OK).json({
    success: true,
    summary: {
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      uploadLimit: settings.uploadLimit,
    },
    previewRows: rows.map(({ rowNumber, raw }) => {
      const invalid = invalidRows.find((row) => row.rowNumber === rowNumber);
      return {
        rowNumber,
        ...raw,
        isValid: !invalid,
        errors: invalid?.errors || [],
      };
    }),
  });
};

const confirmStudentsImport = async (req, res) => {
  const settings = await getAdminSettingsDoc();
  const rows = await parseCsvFromRequest(req);

  if (rows.length > settings.uploadLimit) {
    throw new CustomAPIError.BadRequestError(
      `Upload limit exceeded. Max allowed rows: ${settings.uploadLimit}`
    );
  }

  const { validRows, invalidRows } = await validateImportRows(rows);
  const createdStudentIds = [];
  let forcePasswordResetCount = 0;

  if (validRows.length) {
    for (const validRow of validRows) {
      const { mapped } = validRow;
      const generatedPassword = settings.dobPasswordEnabled
        ? dobToPassword(mapped.dob)
        : mapped.rollNo;

      const user = await UserModel.create({
        name: mapped.name,
        email: mapped.email,
        password: generatedPassword,
        role: 'student',
        rollNo: mapped.rollNo,
        courseId: mapped.courseId,
        courseName: mapped.courseName,
        courseLevel: mapped.courseLevel,
        yearsCount: mapped.yearsCount,
        semestersCount: mapped.semestersCount,
        departmentId: mapped.departmentId,
        departmentName: mapped.departmentName,
        batchId: mapped.batchId,
        batchYear: mapped.batchYear,
        forcePasswordReset: settings.forcePasswordResetOnFirstLogin,
      });

      if (settings.forcePasswordResetOnFirstLogin) {
        forcePasswordResetCount += 1;
      }

      await PersonalDataModel.create({
        studentId: user._id,
        fatherName: 'Not Available',
        motherName: 'Not Available',
        contactNumber: `temp-${mapped.rollNo}`,
        address: {
          locality: 'Unknown',
          city: 'Unknown',
          pincode: '000000',
          district: 'Unknown',
          state: 'Unknown',
        },
        dateOfBirth: mapped.dob.date,
      });

      createdStudentIds.push(user._id.toString());
    }
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: `Imported ${createdStudentIds.length} students`,
    summary: {
      totalRows: rows.length,
      importedCount: createdStudentIds.length,
      failedCount: invalidRows.length,
      forcePasswordResetCount,
    },
    failedRows: invalidRows,
  });
};

const csvEscape = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
};

const formatDob = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const exportStudentsCsv = async (req, res) => {
  const { course, departments, batches } = req.query || {};

  const query = { role: 'student' };
  if (course) query.courseId = course;
  if (departments) query.departmentId = { $in: String(departments).split('|') };
  if (batches) query.batchId = { $in: String(batches).split('|') };

  const students = await UserModel.find(query)
    .select(
      '_id name rollNo email courseName departmentName batchYear isBlocked forcePasswordReset'
    )
    .sort('rollNo')
    .lean();

  const studentIds = students.map((student) => student._id);
  const personalRows = await PersonalDataModel.find({
    studentId: { $in: studentIds },
  })
    .select('studentId dateOfBirth')
    .lean();

  const dobByStudentId = new Map(
    personalRows.map((row) => [row.studentId.toString(), row.dateOfBirth])
  );

  const lines = [EXPORT_HEADERS.join(',')];
  const exportForcePasswordResetCount = students.reduce(
    (acc, student) => acc + (student.forcePasswordReset ? 1 : 0),
    0
  );
  students.forEach((student) => {
    lines.push(
      [
        student.name,
        student.rollNo,
        student.email,
        student.courseName,
        student.departmentName,
        student.batchYear,
        formatDob(dobByStudentId.get(student._id.toString())),
        student.isBlocked ? 'Blocked' : 'Active',
        student.forcePasswordReset ? 'Yes' : 'No',
      ]
        .map(csvEscape)
        .join(',')
    );
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="students-export-${Date.now()}.csv"`
  );
  res.setHeader(
    'X-Force-Password-Reset-Count',
    String(exportForcePasswordResetCount)
  );
  res.status(StatusCodes.OK).send(lines.join('\n'));
};

const downloadSampleStudentCsv = async (req, res) => {
  const sample = 'Name,Roll No,Email,Course,Department,Batch,DOB\n';

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students-sample.csv"');
  res.status(StatusCodes.OK).send(sample);
};

module.exports = {
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  previewStudentsImport,
  confirmStudentsImport,
  exportStudentsCsv,
  downloadSampleStudentCsv,
};
