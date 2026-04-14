const { ObjectId } = require('mongoose').Types;

function studentProfileDetailsAgg(studentId, isPrivate = false) {
  const pipeline = [
    {
      $match: {
        _id: new ObjectId(studentId),
      },
    },
    {
      $project: {
        name: 1,
        photo: 1,
        courseName: 1,
        courseLevel: 1,
        departmentName: 1,
        isLateralEntry: 1,
        rollNo: 1,
        batchYear: 1,
        yearsCount: 1,
        skills: 1,
        achievements: 1,
        semestersCount: 1,
        personalDetails: 1,
        educationDetails: 1,
        trainings: 1,
        experiences: 1,
        placements: 1,
      },
    },
    {
      $lookup: {
        from: 'StudentTrainings',
        localField: 'trainings',
        foreignField: '_id',
        as: 'trainings',
        pipeline: [
          {
            $sort: {
              startDate: -1,
            },
          },
          {
            $project: {
              createdAt: 0,
              updatedAt: 0,
              studentId: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'StudentExperiences',
        localField: 'experiences',
        foreignField: '_id',
        as: 'experiences',
        pipeline: [
          {
            $sort: {
              startDate: -1,
            },
          },
          {
            $project: {
              createdAt: 0,
              updatedAt: 0,
              studentId: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'StudentEducationData',
        localField: 'educationDetails',
        foreignField: '_id',
        as: 'educationDetails',
      },
    },
    {
      $unwind: {
        path: '$educationDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (isPrivate) {
    pipeline.push(
      {
        $lookup: {
          from: 'StudentPersonalData',
          localField: 'personalDetails',
          foreignField: '_id',
          as: 'personalDetails',
        },
      },
      {
        $unwind: {
          path: '$personalDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'StudentPlacements',
          localField: 'placements',
          foreignField: '_id',
          as: 'placements',
        },
      }
    );
  }

  return pipeline;
}

module.exports = {
  studentProfileDetailsAgg,
};
