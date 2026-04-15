const UserModel = require('../models/User');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');
const OfferModel = require('../models/Offer');
const ResumeModel = require('../models/Resume');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { validateStudentCourse } = require('../utils');
const JobOpeningModel = require('../models/JobOpenings');
const { PlacementModel, EducationModel, CurrentScoreModel, PastScoreModel, ExperienceModel, TrainingModel, PersonalDataModel, } = require('../models/student');
const { default: mongoose } = require('mongoose');

const getStudents = async (req, res) => {
  const requestQuery = req.query || {};
  const page = requestQuery.page || 1;
  const limit = requestQuery.limit || 15;

  const { course, departments, batches } = requestQuery;

  const skip = (page - 1) * limit;

  const query = { role: 'student' };

  if (course) query['courseId'] = course;
  if (batches) query['batchId'] = { $in: batches.split('|') };
  if (departments) query['departmentId'] = { $in: departments.split('|') };

  const studentsCount = await UserModel.countDocuments(query);
  const totalPages = Math.ceil(studentsCount / limit);

  if (totalPages && totalPages < page)
    throw new CustomAPIError.BadRequestError(`Invalid page no ${page}`);

  const students = await UserModel.find(query)
    .select(
      'name isLateralEntry rollNo courseId courseName batchId batchYear departmentId departmentName isBlocked forcePasswordReset'
    )
    .sort('rollNo')
    .skip(skip)
    .limit(limit);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found students',
    students,
    page,
    limit,
    totalPages,
  });
};

const addSingleStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    rollNo,
    isLateralEntry,
    courseId,
    departmentId,
    batchId,
  } = req.body;

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password and Confirm Password don't match!"
    );

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.create({
    name,
    email,
    password,
    rollNo,
    isLateralEntry,
    yearsCount,
    semestersCount,
    courseId,
    courseLevel,
    courseName,
    departmentId,
    departmentName,
    batchId,
    batchYear,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created student',
    id: user._id,
  });
};

const updateSingleStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim())
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const { name, rollNo, isLateralEntry, courseId, departmentId, batchId } =
    req.body;

  const {
    courseName,
    courseLevel,
    departmentName,
    batchYear,
    yearsCount,
    semestersCount,
  } = await validateStudentCourse({
    courseId,
    departmentId,
    batchId,
    isLateralEntry,
  });

  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      name,
      rollNo,
      isLateralEntry,
      yearsCount,
      semestersCount,
      courseId,
      courseLevel,
      courseName,
      departmentId,
      departmentName,
      batchId,
      batchYear,
    },
    { runValidators: true }
  );

  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated student',
  });
};

const deleteSingleStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim())
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndDelete({ _id: id, role: 'student' });
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const jobApplications = await JobApplicationModel.find({ applicantId: id }).select(
    '_id jobId'
  );
  const applicationIds = jobApplications.map((application) => application._id);

  const acceptedOffers = await OfferModel.find({
    studentId: id,
    status: 'accepted',
  }).select('companyId');

  const companyDecrement = acceptedOffers.reduce((acc, offer) => {
    const companyId = offer.companyId?.toString();
    if (companyId) acc[companyId] = (acc[companyId] || 0) + 1;
    return acc;
  }, {});

  await Promise.all([
    JobApplicationModel.deleteMany({ applicantId: id }),
    OfferModel.deleteMany({ studentId: id }),
    PlacementModel.deleteMany({ studentId: id }),
    ResumeModel.deleteMany({ studentId: id }),
    PersonalDataModel.deleteMany({ studentId: id }),
    EducationModel.deleteMany({ studentId: id }),
    CurrentScoreModel.deleteMany({ studentId: id }),
    PastScoreModel.deleteMany({ studentId: id }),
    ExperienceModel.deleteMany({ studentId: id }),
    TrainingModel.deleteMany({ studentId: id }),
    JobOpeningModel.updateMany(
      {
        $or: [
          { applicants: id },
          { shortlistedCandidates: id },
          { selectedCandidates: id },
          { rejectedCandidates: id },
          { applications: { $in: applicationIds } },
        ],
      },
      {
        $pull: {
          applicants: id,
          shortlistedCandidates: id,
          selectedCandidates: id,
          rejectedCandidates: id,
          applications: { $in: applicationIds },
        },
      }
    ),
  ]);

  await Promise.all(
    Object.entries(companyDecrement).map(async ([companyId, count]) => {
      const company = await CompanyModel.findById(companyId);
      if (!company) return;
      company.candidatesHired = Math.max(
        0,
        (company.candidatesHired || 0) - count
      );
      await company.save();
    })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student deleted successfully',
  });
};

const blockStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim())
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndUpdate(
    { _id: id, role: 'student' },
    { isBlocked: true },
    { new: true }
  );
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student blocked successfully',
  });
};

const unblockStudent = async (req, res) => {
  const id = req?.params?.id;

  if (!id?.trim())
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  const user = await UserModel.findOneAndUpdate(
    { _id: id, role: 'student' },
    { isBlocked: false },
    { new: true }
  );
  if (!user)
    throw new CustomAPIError.NotFoundError(`No student found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student unblocked successfully',
  });
};

const getCompanies = async (req, res) => {
  const companies = await CompanyModel.aggregate([
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: '_id',
        foreignField: 'company.id',
        as: 'jobs',
      },
    },
    {
      $lookup: {
        from: JobApplicationModel.collection.name,
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$companyId', '$$companyId'] },
                  { $eq: ['$status', 'hired'] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'hiredApplications',
      },
    },
    {
      $addFields: {
        jobsPosted: { $size: '$jobs' },
        openingsCreated: { $sum: '$jobs.openingsCount' },
        candidatesHired: {
          $ifNull: [{ $arrayElemAt: ['$hiredApplications.count', 0] }, 0],
        },
      },
    },
    {
      $project: {
        admins: 0,
        jobs: 0,
        hiredApplications: 0,
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Companies found!',
    companies,
  });
};

const getSingleCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company Id is required!');

  const company = await CompanyModel.findById(companyId).populate({
    path: 'admins',
    select: 'name email photo companyRole',
  });

  if (!company)
    throw new CustomAPIError.NotFoundError(
      `No company found with id: ${companyId}`
    );

  const companyJobs = await JobOpeningModel.aggregate([
    { $match: { 'company.id': company._id } },
    {
      $lookup: {
        from: JobApplicationModel.collection.name,
        let: { jobId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$jobId', '$$jobId'] } } },
          {
            $group: {
              _id: null,
              applicantsCount: { $sum: 1 },
              hiredCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'hired'] }, 1, 0],
                },
              },
            },
          },
        ],
        as: 'applicationStats',
      },
    },
    {
      $addFields: {
        applicantsCount: {
          $ifNull: [{ $arrayElemAt: ['$applicationStats.applicantsCount', 0] }, 0],
        },
        hiredCount: {
          $ifNull: [{ $arrayElemAt: ['$applicationStats.hiredCount', 0] }, 0],
        },
        jobPackage: {
          $ifNull: ['$jobPackage', '$salary', '$package', 0],
        },
      },
    },
    {
      $project: {
        applicationStats: 0,
        description: 0,
        keySkills: 0,
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
        postedBy: 0,
        applicants: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        applications: 0,
      },
    },
  ]);

  const jobsPosted = companyJobs.length;
  const openingsCreated = companyJobs.reduce(
    (sum, job) => sum + (job.openingsCount || 0),
    0
  );
  const candidatesHired = companyJobs.reduce(
    (sum, job) => sum + (job.hiredCount || 0),
    0
  );

  const hiredCandidates = await JobApplicationModel.aggregate([
    { $match: { companyId: company._id, status: 'hired' } },
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'applicantId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: { path: '$student', preserveNullAndEmptyArrays: false } },
    {
      $addFields: {
        package: {
          $let: {
            vars: {
              pkgVal: {
                $ifNull: ['$job.jobPackage', '$job.salary', '$job.package', null],
              },
            },
            in: {
              $cond: [
                { $and: [{ $ne: ['$$pkgVal', null] }, { $ne: ['$$pkgVal', 0] }] },
                { $cond: [{ $gt: ['$$pkgVal', 100] }, { $divide: ['$$pkgVal', 100000] }, '$$pkgVal'] },
                null,
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        studentId: '$student._id',
        name: '$student.name',
        course: '$student.courseName',
        branch: '$student.departmentName',
        jobRole: '$job.profile',
        package: 1,
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company found!',
    company: {
      ...company.toObject(),
      jobsPosted,
      openingsCreated,
      candidatesHired,
      jobs: companyJobs,
      hiredCandidates,
    },
  });
};

const addCompany = async (req, res) => {
  const { companyName: name, companyEmail: email, about, accessTill } = req.body;
  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

  const company = await CompanyModel.create({
    name,
    email,
    about,
    website,
    accessTill: accessTill ? new Date(accessTill) : undefined,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company created',
    id: company._id,
  });
};

const updateCompany = async (req, res) => {
  const companyId = req?.params?.companyId;
  const { companyName: name, companyEmail: email, about, accessTill } = req.body;

  let website = req?.body?.website;

  if (website && !website.match(/^https?:\/\//)) {
    website += 'https://';
  }

  const company = await CompanyModel.findByIdAndUpdate(
    companyId,
    {
      name,
      email,
      about,
      website,
      accessTill: accessTill ? new Date(accessTill) : undefined,
    },
    { runValidators: true }
  );

  if (!company)
    throw new CustomAPIError.NotFoundError(`No company found with id: ${companyId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company updated!',
    id: company._id,
  });

  await JobOpeningModel.updateMany(
    { 'company.id': new mongoose.Types.ObjectId(companyId) },
    {
      $set: {
        'company.name': name,
        'company.website': website,
      },
    }
  );
};

const deleteCompany = async (req, res) => {
  const companyId = req?.params?.companyId;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company Id is required!');

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.NotFoundError(
      `No company found with id: ${companyId}`
    );

  await Promise.all([
    JobOpeningModel.deleteMany({ 'company.id': company._id }),
    JobApplicationModel.deleteMany({ companyId: company._id }),
    OfferModel.deleteMany({ companyId: company._id }),
    UserModel.deleteMany({ companyId: company._id, role: 'company_admin' }),
  ]);

  await company.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Company deleted successfully',
  });
};

const addCompanyAdmin = async (req, res) => {
  const companyId = req?.params?.companyId;
  const {
    companyAdminName: name,
    companyAdminEmail: email,
    companyAdminPassword: password,
    confirmAdminPassword: confirmPassword,
    adminRole: companyRole,
  } = req.body;
  const role = 'company_admin';

  if (password !== confirmPassword)
    throw new CustomAPIError.BadRequestError(
      "Password & Confirm Password don't match!"
    );

  if (!companyRole?.trim() || !companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company & Role is required!');

  const company = await CompanyModel.findById(companyId);
  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company found with id: ${companyId}`
    );

  const companyAdmin = await UserModel.create({
    name,
    email: email.trim().toLowerCase(),
    password,
    companyRole,
    companyId,
    role,
  });

  company.admins.push(companyAdmin._id);
  await company.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Company Admin created!',
    id: companyAdmin._id,
  });
};

const getAdminStats = async (req, res) => {
  const hiredApplicationsAgg = [
    { $match: { status: 'hired' } },
    {
      $lookup: {
        from: JobOpeningModel.collection.name,
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: { path: '$job', preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'applicantId',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: { path: '$student', preserveNullAndEmptyArrays: false } },
    {
      $addFields: {
        jobPackageValue: {
          $let: {
            vars: {
              pkgVal: {
                $ifNull: ['$job.jobPackage', '$job.salary', '$job.package', null],
              },
            },
            in: {
              $cond: [
                { $and: [{ $ne: ['$$pkgVal', null] }, { $ne: ['$$pkgVal', 0] }] },
                { $cond: [{ $gt: ['$$pkgVal', 100] }, { $divide: ['$$pkgVal', 100000] }, '$$pkgVal'] },
                null,
              ],
            },
          },
        },
      },
    },
    {
      $facet: {
        metrics: [
          {
            $group: {
              _id: null,
              avgPackage: {
                $avg: {
                  $cond: [{ $ne: ['$jobPackageValue', null] }, '$jobPackageValue', null],
                },
              },
              highestPackage: {
                $max: {
                  $cond: [{ $ne: ['$jobPackageValue', null] }, '$jobPackageValue', null],
                },
              },
              totalHired: { $sum: 1 },
            },
          },
        ],
        departmentPlacements: [
          {
            $group: {
              _id: {
                $ifNull: ['$student.departmentName', 'Unknown'],
              },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ];

  const [studentCount, companyCount, jobCount, hiredStats] =
    await Promise.all([
      UserModel.countDocuments({ role: 'student' }),
      CompanyModel.countDocuments(),
      JobOpeningModel.countDocuments(),
      JobApplicationModel.aggregate(hiredApplicationsAgg),
    ]);

  const metricResult = hiredStats?.[0]?.metrics?.[0] || {};
  const deptPlacements = hiredStats?.[0]?.departmentPlacements || [];
  const totalHired = metricResult.totalHired || 0;

  let avgPackage = null;
  let highestPackage = null;

  if (totalHired > 0 && metricResult.avgPackage != null) {
    avgPackage = Number(metricResult.avgPackage.toFixed(2));
  }
  if (totalHired > 0 && metricResult.highestPackage != null) {
    highestPackage = Number(metricResult.highestPackage.toFixed(2));
  }

  const stats = {
    totalStudents: studentCount,
    totalCompanies: companyCount,
    totalJobsPosted: jobCount,
    totalCandidatesHired: totalHired,
    avgPackage,
    highestPackage,
    departmentPlacements: deptPlacements.map((d) => ({
      name: d._id || 'Unknown',
      value: d.count,
    })),
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Admin stats retrieved!',
    stats,
  });
};

module.exports = {
  addSingleStudent,
  updateSingleStudent,
  deleteSingleStudent,
  blockStudent,
  unblockStudent,
  getStudents,
  getCompanies,
  getSingleCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  addCompanyAdmin,
  getAdminStats,
};
