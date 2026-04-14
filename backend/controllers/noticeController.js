const {
  CourseModel,
  DepartmentModel,
  BatchModel,
} = require('../models/Course');

const NoticeModel = require('../models/Notice');
const UserModel = require('../models/User');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { fileUpload } = require('../utils/fileUpload');

const createNotice = async (req, res) => {
  let {
    noticeTitle,
    noticeBody,
    targetType = 'all',
    receivingCourse,
    receivingBatches,
    receivingDepartments,
    isUrgent,
  } = req.body;

  // Handle arrays that might come as JSON strings or undefined
  receivingBatches = receivingBatches ? 
    (typeof receivingBatches === 'string' ? JSON.parse(receivingBatches) : receivingBatches) : [];
  receivingDepartments = receivingDepartments ? 
    (typeof receivingDepartments === 'string' ? JSON.parse(receivingDepartments) : receivingDepartments) : [];

  let noticeFile = req?.files?.noticeFile;
  if (!noticeTitle?.trim() || !noticeBody?.trim())
    throw new CustomAPIError.BadRequestError(
      'Notice title and body are required!'
    );

  const createdBy = req.user?.userId;

  const {
    targetType: validatedTargetType,
    course,
    batches,
    departments,
  } = await validateNoticeReceivers({
    targetType,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  if (noticeFile) {
    const fileUploadResp = await fileUpload(noticeFile, 'notices', 'document');
    noticeFile = fileUploadResp?.fileURL;
  }

  const notice = await NoticeModel.create({
    noticeTitle,
    noticeBody,
    noticeFile,
    isUrgent: Boolean(isUrgent),
    targetType: validatedTargetType,
    receivingCourse: course?._id,
    receivingBatches,
    receivingDepartments,
    createdBy,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Notice Created!',
    id: notice._id,
  });

  if (course) {
    course.lastNoticeTime = notice.createdAt;

    for (let batch of batches) {
      batch.lastNoticeTime = notice.createdAt;
    }

    for (let department of departments) {
      department.lastNoticeTime = notice.createdAt;
    }

    await course.save();
  }
};

const updateNotice = async (req, res) => {
  let {
    noticeTitle,
    noticeBody,
    targetType = 'all',
    receivingCourse,
    receivingBatches,
    receivingDepartments,
    isUrgent,
  } = req.body;

  // Handle arrays that might come as JSON strings or undefined
  receivingBatches = receivingBatches ? 
    (typeof receivingBatches === 'string' ? JSON.parse(receivingBatches) : receivingBatches) : [];
  receivingDepartments = receivingDepartments ? 
    (typeof receivingDepartments === 'string' ? JSON.parse(receivingDepartments) : receivingDepartments) : [];

  let noticeFile = req?.files?.noticeFile;

  const createdBy = req.user?.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required');

  if (!noticeTitle?.trim() || !noticeBody?.trim())
    throw new CustomAPIError.BadRequestError(
      'Notice title and body are required!'
    );

  const notice = await NoticeModel.findOne({ _id: id, createdBy });
  if (!notice)
    throw new CustomAPIError.NotFoundError(`No notice found with id: ${id}`);

  const {
    targetType: validatedTargetType,
    course,
    batches,
    departments,
  } = await validateNoticeReceivers({
    targetType,
    receivingCourse,
    receivingBatches,
    receivingDepartments,
  });

  if (noticeFile) {
    const fileUploadResp = await fileUpload(noticeFile, 'notices', 'document');
    noticeFile = fileUploadResp?.fileURL;
  } else {
    noticeFile = notice.noticeFile;
  }

  const updatedNotice = await NoticeModel.findByIdAndUpdate(
    id,
    {
      noticeTitle,
      noticeBody,
      noticeFile,
      isUrgent: Boolean(isUrgent),
      targetType: validatedTargetType,
      receivingCourse: course?._id,
      receivingBatches,
      receivingDepartments,
    },
    { runValidators: true, new: true }
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Notice Updated!',
    id,
  });

  if (course) {
    course.lastNoticeTime = updatedNotice.updatedAt;

    for (let batch of batches) {
      batch.lastNoticeTime = updatedNotice.updatedAt;
    }

    for (let department of departments) {
      department.lastNoticeTime = updatedNotice.updatedAt;
    }

    await course.save();
  }
};

const deleteNotice = async (req, res) => {
  const createdBy = req.user?.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required');

  const notice = await NoticeModel.findOne({ _id: id, createdBy });
  if (!notice)
    throw new CustomAPIError.NotFoundError(`No notice found with id: ${id}`);

  await NoticeModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notice deleted!',
    id,
  });

  if (!notice.receivingCourse) return;

  const { receivingCourse, receivingBatches, receivingDepartments } = notice;
  const course = await CourseModel.findById(receivingCourse);
  if (!course) return;

  let courseLastNotice = await NoticeModel.find({ receivingCourse })
    .sort('-updatedAt')
    .limit(1);
  courseLastNotice = courseLastNotice[0];

  course.lastNoticeTime = courseLastNotice?.updatedAt || new Date();

  for (let receivingBatch of receivingBatches) {
    const batch = course.batches.get(receivingBatch.toString());
    if (!batch) continue;

    let batchLastNotice = await NoticeModel.find({ receivingBatches: receivingBatch })
      .sort('-updatedAt')
      .limit(1);
    batchLastNotice = batchLastNotice[0];

    batch.lastNoticeTime = batchLastNotice?.updatedAt || new Date();
  }

  for (let receivingDepartment of receivingDepartments) {
    const department = course.departments.get(receivingDepartment.toString());
    if (!department) continue;

    let departmentLastNotice = await NoticeModel.find({ receivingDepartments: receivingDepartment })
      .sort('-updatedAt')
      .limit(1);
    departmentLastNotice = departmentLastNotice[0];

    department.lastNoticeTime = departmentLastNotice?.updatedAt || new Date();
  }

  await course.save();
};

const getAllNotices = async (req, res) => {
  const notices = await NoticeModel.find()
    .sort('-updatedAt')
    .populate({
      path: 'receivingCourse',
      select: 'courseName',
    })
    .populate({
      path: 'receivingBatches',
      select: 'batchYear',
    })
    .populate({
      path: 'receivingDepartments',
      select: 'departmentName',
    });
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
    notices,
  });
};

const getMyNotices = async (req, res) => {
  const student_id = req.user.userId;
  const student = await UserModel.findById(student_id);

  const { batchId, departmentId, courseId, lastNoticeFetched } = student;

  const conditionalQueries = [
    { targetType: 'all' },
  ];

  if (courseId) {
    conditionalQueries.push({ targetType: 'course', receivingCourse: courseId });
    conditionalQueries.push({ targetType: 'branch', receivingCourse: courseId, receivingDepartments: departmentId });
    conditionalQueries.push({ targetType: 'batch', receivingCourse: courseId, receivingBatches: batchId });
    conditionalQueries.push({ targetType: 'branch_batch', receivingCourse: courseId, receivingDepartments: departmentId, receivingBatches: batchId });

    conditionalQueries.push({ receivingCourse: courseId, receivingDepartments: departmentId, receivingBatches: batchId });
    conditionalQueries.push({ receivingCourse: courseId, receivingDepartments: departmentId });
    conditionalQueries.push({ receivingCourse: courseId, receivingBatches: batchId });
    conditionalQueries.push({ receivingCourse: courseId });
  }

  const notices = await NoticeModel.find({
    $or: conditionalQueries,
  })
    .select(
      'noticeTitle noticeBody noticeFile createdAt updatedAt isUrgent receivingBatches receivingDepartments targetType'
    )
    .populate({
      path: 'receivingBatches',
      select: 'batchYear',
    })
    .populate({
      path: 'receivingDepartments',
      select: 'departmentName',
    })
    .sort('-updatedAt');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
    notices,
    lastNoticeFetched,
  });

  student.lastNoticeFetched = new Date();
  await student.save();
};

async function validateNoticeReceivers(noticeReceivers) {
  const {
    targetType = 'all',
    receivingCourse,
    receivingBatches = [],
    receivingDepartments = [],
  } = noticeReceivers;

  const allowedTypes = ['all', 'course', 'branch', 'batch', 'branch_batch'];
  let resolvedTargetType = targetType?.trim() || 'all';
  if (!allowedTypes.includes(resolvedTargetType)) {
    resolvedTargetType = 'all';
  }

  const normalizeArray = (value) =>
    Array.isArray(value) ? value : typeof value === 'string' && value.length ? [value] : [];

  const batches = normalizeArray(receivingBatches);
  const departments = normalizeArray(receivingDepartments);

  if (resolvedTargetType === 'all') {
    return { targetType: 'all', course: null, batches: [], departments: [] };
  }

  if (!receivingCourse?.trim()) {
    throw new CustomAPIError.BadRequestError('A valid course must be selected for this notice type');
  }

  const course = await CourseModel.findById(receivingCourse);
  if (!course) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${receivingCourse}`
    );
  }

  if (resolvedTargetType === 'course') {
    return { targetType: 'course', course, batches: [], departments: [] };
  }

  if (resolvedTargetType === 'branch') {
    if (!departments.length) {
      throw new CustomAPIError.BadRequestError('At least one branch must be selected for branch targeting');
    }
    const validDepartments = [];
    for (let receivingDepartment of departments) {
      const department = course.departments.get(receivingDepartment.toString());
      if (!department) {
        throw new CustomAPIError.BadRequestError(
          `No Department found with id: ${receivingDepartment}`
        );
      }
      validDepartments.push(department);
    }
    return {
      targetType: 'branch',
      course,
      batches: [],
      departments: validDepartments,
    };
  }

  if (resolvedTargetType === 'batch') {
    if (!batches.length) {
      throw new CustomAPIError.BadRequestError('At least one batch must be selected for batch targeting');
    }
    const validBatches = [];
    for (let receivingBatch of batches) {
      const batch = course.batches.get(receivingBatch.toString());
      if (!batch) {
        throw new CustomAPIError.BadRequestError(
          `No batch found with id: ${receivingBatch}`
        );
      }
      validBatches.push(batch);
    }
    return {
      targetType: 'batch',
      course,
      batches: validBatches,
      departments: [],
    };
  }

  if (resolvedTargetType === 'branch_batch') {
    if (!departments.length || !batches.length) {
      throw new CustomAPIError.BadRequestError(
        'At least one branch and one batch must be selected for branch + batch targeting'
      );
    }

    const validBatches = [];
    const validDepartments = [];

    for (let receivingBatch of batches) {
      const batch = course.batches.get(receivingBatch.toString());
      if (!batch) {
        throw new CustomAPIError.BadRequestError(
          `No batch found with id: ${receivingBatch}`
        );
      }
      validBatches.push(batch);
    }

    for (let receivingDepartment of departments) {
      const department = course.departments.get(receivingDepartment.toString());
      if (!department) {
        throw new CustomAPIError.BadRequestError(
          `No Department found with id: ${receivingDepartment}`
        );
      }
      validDepartments.push(department);
    }

    return {
      targetType: 'branch_batch',
      course,
      batches: validBatches,
      departments: validDepartments,
    };
  }

  // Fallback to inferred targeting when unknown values come through.
  if (!receivingCourse?.trim()) {
    return { targetType: 'all', course: null, batches: [], departments: [] };
  }

  const courseFallback = await CourseModel.findById(receivingCourse);
  if (!courseFallback) {
    throw new CustomAPIError.BadRequestError(
      `No course found with id: ${receivingCourse}`
    );
  }

  return { targetType: 'all', course: courseFallback, batches: [], departments: [] };
}

module.exports = {
  createNotice,
  updateNotice,
  deleteNotice,
  getAllNotices,
  getMyNotices,
  validateNoticeReceivers,
};
