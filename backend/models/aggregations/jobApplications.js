const mongoose = require('mongoose');

// Helper function to build filter conditions
function buildFilterMatch(filters) {
  const matchConditions = {};
  
  // Build $or conditions for search
  const orConditions = [];
  if (filters.search) {
    orConditions.push(
      { applicantName: { $regex: filters.search, $options: 'i' } },
      { applicantEmail: { $regex: filters.search, $options: 'i' } },
      { applicantSkills: { $regex: filters.search, $options: 'i' } }
    );
  }
  
  // Add status filter
  if (filters.status) {
    matchConditions.status = filters.status;
  }
  
  // Add resume filter
  if (filters.hasResume !== undefined && filters.hasResume !== null) {
    if (filters.hasResume === 'true' || filters.hasResume === true) {
      matchConditions.resume = { $exists: true, $ne: '' };
    } else {
      orConditions.push(
        { resume: { $exists: false } },
        { resume: '' }
      );
    }
  }
  
  // Add branch filter
  if (filters.branch) {
    matchConditions.applicantBranch = filters.branch;
  }
  
  // Add skills filter
  if (filters.skills && filters.skills.length > 0) {
    // Handle both string and array formats
    const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
    matchConditions.applicantSkills = { $in: skillsArray };
  }
  
  // Add CGPA filter
  if (filters.minCGPA !== undefined && filters.minCGPA !== null && filters.minCGPA !== '') {
    matchConditions.applicantCGPA = { $gte: parseFloat(filters.minCGPA) };
  }
  
  // Add 10th percentage filter
  if (filters.min10thPercentage !== undefined && filters.min10thPercentage !== null && filters.min10thPercentage !== '') {
    matchConditions.applicant10thPercentage = { $gte: parseFloat(filters.min10thPercentage) };
  }
  
  // Add 12th percentage filter
  if (filters.min12thPercentage !== undefined && filters.min12thPercentage !== null && filters.min12thPercentage !== '') {
    matchConditions.applicant12thPercentage = { $gte: parseFloat(filters.min12thPercentage) };
  }
  
  // Add graduation percentage filter
  if (filters.minGraduationPercentage !== undefined && filters.minGraduationPercentage !== null && filters.minGraduationPercentage !== '') {
    matchConditions.applicantGraduationPercentage = { $gte: parseFloat(filters.minGraduationPercentage) };
  }
  
  // Add $or conditions if any exist
  if (orConditions.length > 0) {
    matchConditions.$or = orConditions;
  }
  
  return matchConditions;
}

// Helper function to build sort conditions
function buildSort(sortBy) {
  const sortMap = {
    'highest-cgpa': { applicantCGPA: -1 },
    'highest-graduation': { applicantGraduationPercentage: -1 },
    'recently-applied': { appliedAt: -1 },
  };
  return sortMap[sortBy] || {};
}

function jobApplicationsAgg({ companyId }) {
  companyId = new mongoose.Types.ObjectId(companyId);
  return [
    {
      $match: {
        'company.id': companyId,
        status: 'open',
        applications: {
          $exists: true,
          $not: {
            $size: 0,
          },
        },
      },
    },
    {
      $addFields: {
        shortlistedCount: {
          $size: '$shortlistedCandidates',
        },
        pendingCount: {
          $size: '$applicants',
        },
        hiredCount: {
          $size: '$selectedCandidates',
        },
        rejectedCount: {
          $size: '$rejectedCandidates',
        },
      },
    },
    {
      $project: {
        profile: 1,
        openingsCount: 1,
        deadline: 1,
        applications: 1,
        shortlistedCount: 1,
        hiredCount: 1,
        rejectedCount: 1,
        pendingCount: 1,
      },
    },
    {
      $lookup: {
        from: 'jobapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'applicantId',
              foreignField: '_id',
              as: 'applicantUserData',
            },
          },
          {
            $unwind: {
              path: '$applicantUserData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'StudentEducationData',
              localField: 'applicantId',
              foreignField: 'studentId',
              as: 'educationData',
            },
          },
          {
            $unwind: {
              path: '$educationData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              applicantId: 1,
              applicantName: 1,
              applicantEmail: '$applicantUserData.email',
              applicantBranch: '$applicantUserData.departmentName',
              coverLetter: 1,
              resume: 1,
              portfolio: 1,
              status: 1,
              appliedAt: '$createdAt',
              applicantCGPA: {
                $cond: [
                  '$educationData.graduation.aggregateGPA',
                  '$educationData.graduation.aggregateGPA',
                  null,
                ],
              },
              applicant10thPercentage: {
                $cond: [
                  '$educationData.highschool',
                  '$educationData.highschool.score',
                  null,
                ],
              },
              applicant12thPercentage: {
                $cond: [
                  '$educationData.intermediate',
                  '$educationData.intermediate.score',
                  null,
                ],
              },
              applicantGraduationPercentage: {
                $cond: [
                  {
                    $and: [
                      '$educationData.graduation.scores',
                      { $gt: [{ $size: '$educationData.graduation.scores' }, 0] },
                    ],
                  },
                  {
                    $avg: '$educationData.graduation.scores.gpa',
                  },
                  null,
                ],
              },
            },
          },
          {
            $group: {
              _id: { status: '$status' },
              applications: {
                $push: '$$ROOT',
              },
            },
          },
        ],
      },
    },
  ];
}

// Enhanced aggregation function supporting filters
function jobApplicationsAggWithFilters({ companyId, filters = {} }) {
  companyId = new mongoose.Types.ObjectId(companyId);
  
  const filterMatch = buildFilterMatch(filters);
  const sortOrder = buildSort(filters.sortBy);
  
  return [
    {
      $match: {
        'company.id': companyId,
        status: 'open',
        applications: {
          $exists: true,
          $not: {
            $size: 0,
          },
        },
      },
    },
    {
      $addFields: {
        shortlistedCount: {
          $size: '$shortlistedCandidates',
        },
        pendingCount: {
          $size: '$applicants',
        },
        hiredCount: {
          $size: '$selectedCandidates',
        },
        rejectedCount: {
          $size: '$rejectedCandidates',
        },
      },
    },
    {
      $project: {
        profile: 1,
        openingsCount: 1,
        deadline: 1,
        applications: 1,
        shortlistedCount: 1,
        hiredCount: 1,
        rejectedCount: 1,
        pendingCount: 1,
      },
    },
    {
      $lookup: {
        from: 'jobapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'applicantId',
              foreignField: '_id',
              as: 'applicantUserData',
            },
          },
          {
            $unwind: {
              path: '$applicantUserData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'StudentEducationData',
              localField: 'applicantId',
              foreignField: 'studentId',
              as: 'educationData',
            },
          },
          {
            $unwind: {
              path: '$educationData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              applicantId: 1,
              applicantName: 1,
              applicantEmail: '$applicantUserData.email',
              applicantBranch: '$applicantUserData.departmentName',
              coverLetter: 1,
              resume: 1,
              portfolio: 1,
              status: 1,
              appliedAt: '$createdAt',
              applicantCGPA: {
                $cond: [
                  '$educationData.graduation.aggregateGPA',
                  '$educationData.graduation.aggregateGPA',
                  null,
                ],
              },
              applicant10thPercentage: {
                $cond: [
                  '$educationData.highschool',
                  '$educationData.highschool.score',
                  null,
                ],
              },
              applicant12thPercentage: {
                $cond: [
                  '$educationData.intermediate',
                  '$educationData.intermediate.score',
                  null,
                ],
              },
              applicantGraduationPercentage: {
                $cond: [
                  {
                    $and: [
                      '$educationData.graduation.scores',
                      { $gt: [{ $size: '$educationData.graduation.scores' }, 0] },
                    ],
                  },
                  {
                    $avg: '$educationData.graduation.scores.gpa',
                  },
                  null,
                ],
              },
            },
          },
          // Apply filters if provided
          ...(Object.keys(filterMatch).length > 0 ? [{ $match: filterMatch }] : []),
          // Apply sorting if provided
          ...(Object.keys(sortOrder).length > 0 ? [{ $sort: sortOrder }] : []),
          {
            $group: {
              _id: { status: '$status' },
              applications: {
                $push: '$$ROOT',
              },
            },
          },
        ],
      },
    },
  ];
}

function singleJobApplicationsAgg({ jobId, companyId }) {
  jobId = new mongoose.Types.ObjectId(jobId);
  companyId = new mongoose.Types.ObjectId(companyId);
  return [
    {
      $match: {
        _id: jobId,
        'company.id': companyId,
      },
    },
    {
      $addFields: {
        shortlistedCount: {
          $size: '$shortlistedCandidates',
        },
        pendingCount: {
          $size: '$applicants',
        },
        hiredCount: {
          $size: '$selectedCandidates',
        },
        rejectedCount: {
          $size: '$rejectedCandidates',
        },
      },
    },
    {
      $project: {
        profile: 1,
        openingsCount: 1,
        deadline: 1,
        applications: 1,
        shortlistedCount: 1,
        hiredCount: 1,
        rejectedCount: 1,
        pendingCount: 1,
      },
    },
    {
      $lookup: {
        from: 'jobapplications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications',
        pipeline: [
          {
            $project: {
              applicantId: 1,
              applicantName: 1,
              coverLetter: 1,
              resume: 1,
              portfolio: 1,
              status: 1,
              offerId: 1,
            },
          },
          {
            $lookup: {
              from: 'offers',
              localField: 'offerId',
              foreignField: '_id',
              as: 'offer',
            },
          },
          {
            $addFields: {
              offer: { $arrayElemAt: ['$offer', 0] },
            },
          },
          {
            $group: {
              _id: { status: '$status' },
              applications: {
                $push: '$$ROOT',
              },
            },
          },
        ],
      },
    },
  ];
}

function studentJobApplicationsAgg({ applicantId }) {
  applicantId = new mongoose.Types.ObjectId(applicantId);
  return [
    {
      $match: {
        applicantId: applicantId,
      },
    },
    {
      $project: {
        portfolio: 1,
        resume: 1,
        coverLetter: 1,
        jobId: 1,
        status: 1,
      },
    },
    {
      $lookup: {
        from: 'jobopenings',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job',
        pipeline: [
          {
            $project: {
              profile: 1,
              company: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$job',
    },
    {
      $group: {
        _id: { status: '$status' },
        application: {
          $push: '$$ROOT',
        },
      },
    },
  ];
}

module.exports = {
  jobApplicationsAgg,
  jobApplicationsAggWithFilters,
  singleJobApplicationsAgg,
  studentJobApplicationsAgg,
};
