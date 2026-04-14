const mongoose = require('mongoose');

function studentJobOpeningsAgg({ courseId, batchId, departmentId, userId }) {
  userId = new mongoose.Types.ObjectId(userId);
  courseId = new mongoose.Types.ObjectId(courseId);
  batchId = new mongoose.Types.ObjectId(batchId);
  departmentId = new mongoose.Types.ObjectId(departmentId);

  return [
    {
      $match: {
        'receivingCourse.id': courseId,
        'receivingBatch.id': batchId,
        'receivingDepartments.id': departmentId,
        status: 'open',
        deadline: {
          $gte: new Date(),
        },
        applicants: {
          $nin: [userId],
        },
        shortlistedCandidates: {
          $nin: [userId],
        },
        selectedCandidates: {
          $nin: [userId],
        },
        rejectedCandidates: {
          $nin: [userId],
        },
      },
    },
    {
      $project: {
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
        applicants: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        status: 0,
        applications: 0,
        openingsCount: 0,
        description: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
}

function studentJobsByStatusAgg({ userId, status }) {
  const jobInclude = { _id: 0 };
  const jobExclude = {};
  let jobPath;

  switch (status) {
    case 'applied':
      jobPath = 'jobsApplied';
      jobInclude['jobsApplied'] = 1;
      jobExclude['jobsApplied'] = 0;
      break;
    case 'rejected':
      jobPath = 'jobsRejected';
      jobInclude['jobsRejected'] = 1;
      jobExclude['jobsRejected'] = 0;
      break;
    case 'shortlisted':
      jobPath = 'jobsShortlisted';
      jobInclude['jobsShortlisted'] = 1;
      jobExclude['jobsShortlisted'] = 0;
      break;
    case 'hired':
      jobPath = 'jobsSelected';
      jobInclude['jobsSelected'] = 1;
      jobExclude['jobsSelected'] = 0;
      break;
  }

  return [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $project: jobInclude,
    },
    {
      $lookup: {
        from: 'jobopenings',
        localField: jobPath,
        foreignField: '_id',
        as: 'jobs',
        pipeline: [
          {
            $project: {
              receivingCourse: 0,
              receivingBatch: 0,
              receivingDepartments: 0,
              applicants: 0,
              shortlistedCandidates: 0,
              rejectedCandidates: 0,
              selectedCandidates: 0,
              status: 0,
              applications: 0,
              openingsCount: 0,
              description: 0,
            },
          },
        ],
      },
    },
    {
      $project: jobExclude,
    },
    {
      $unwind: {
        path: '$jobs',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$jobs',
      },
    },
  ];
}

function singleJobStudentAgg({
  jobId,
  userId,
  courseId,
  batchId,
  departmentId,
}) {
  userId = new mongoose.Types.ObjectId(userId);
  jobId = new mongoose.Types.ObjectId(jobId);
  courseId = new mongoose.Types.ObjectId(courseId);
  batchId = new mongoose.Types.ObjectId(batchId);
  departmentId = new mongoose.Types.ObjectId(departmentId);

  return [
    {
      $match: {
        _id: jobId,
        'receivingCourse.id': courseId,
        'receivingBatch.id': batchId,
        'receivingDepartments.id': departmentId,
      },
    },
    {
      $addFields: {
        applicationsCount: {
          $size: '$applications',
        },
        applicationStatus: {
          $switch: {
            branches: [
              { case: { $in: [userId, '$applicants'] }, then: 'applied' },
              {
                case: { $in: [userId, '$shortlistedCandidates'] },
                then: 'shortlisted',
              },
              {
                case: { $in: [userId, '$rejectedCandidates'] },
                then: 'rejected',
              },
              {
                case: { $in: [userId, '$selectedCandidates'] },
                then: 'hired',
              },
            ],
            default: 'not applied',
          },
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        receivingCourse: 0,
        receivingBatch: 0,
        receivingDepartments: 0,
      },
    },
  ];
}

function companyInchargeJobsAgg({ companyId, status }) {
  companyId = new mongoose.Types.ObjectId(companyId);

  return [
    {
      $match: {
        'company.id': companyId,
        status,
      },
    },
    {
      $addFields: {
        applicationsCount: {
          $size: '$applications',
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
        status: 0,
        description: 0,
        // profile: 1,
        // company: 1,
        // location: 1,
        // jobPackage: 1,
        // keySkills: 1,
        // deadline: 1,
        // postedBy: 1,
        // applicationsCount: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
}

function singleJobCompanyAgg({ companyId, jobId }) {
  companyId = new mongoose.Types.ObjectId(companyId);
  jobId = new mongoose.Types.ObjectId(jobId);

  return [
    {
      $match: {
        'company.id': companyId,
        _id: jobId,
      },
    },
    {
      $addFields: {
        applicationsCount: {
          $size: '$applications',
        },
      },
    },
    {
      $project: {
        applicants: 0,
        applications: 0,
        shortlistedCandidates: 0,
        rejectedCandidates: 0,
        selectedCandidates: 0,
      },
    },
  ];
}

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  singleJobStudentAgg,
  companyInchargeJobsAgg,
  singleJobCompanyAgg,
};
