const mongoose = require('mongoose');
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

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return [];
};

const resolveMapKey = (value) => {
  if (typeof value === 'string') return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toHexString();
  return null;
};

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

  receivingBatches = normalizeArray(receivingBatches);
  receivingDepartments = normalizeArray(receivingDepartments);

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

  receivingBatches = normalizeArray(receivingBatches);
  receivingDepartments = normalizeArray(receivingDepartments);

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
    const batchKey = resolveMapKey(receivingBatch);
    if (!batchKey) continue;
    const batch = course.batches.get(batchKey);
    if (!batch) continue;

    let batchLastNotice = await NoticeModel.find({ receivingBatches: receivingBatch })
      .sort('-updatedAt')
      .limit(1);
    batchLastNotice = batchLastNotice[0];

    batch.lastNoticeTime = batchLastNotice?.updatedAt || new Date();
  }

  for (let receivingDepartment of receivingDepartments) {
    const departmentKey = resolveMapKey(receivingDepartment);
    if (!departmentKey) continue;
    const department = course.departments.get(departmentKey);
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
    });

  const enrichedNotices = await attachReceiverDetails(notices);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
    notices: enrichedNotices,
  });
};

const getMyNotices = async (req, res) => {
  const student_id = req.user.userId;
  const student = await UserModel.findById(student_id);

  const { batchId, departmentId, courseId, lastNoticeFetched } = student;

  const conditionalQueries = [{ targetType: 'all' }];

  if (courseId) {
    conditionalQueries.push({ targetType: 'course', receivingCourse: courseId });

    if (departmentId) {
      conditionalQueries.push({
        targetType: 'branch',
        receivingCourse: courseId,
        receivingDepartments: { $in: [departmentId] },
      });
    }

    if (batchId) {
      conditionalQueries.push({
        targetType: 'batch',
        receivingCourse: courseId,
        receivingBatches: { $in: [batchId] },
      });
    }

    if (departmentId && batchId) {
      conditionalQueries.push({
        targetType: 'branch_batch',
        receivingCourse: courseId,
        receivingDepartments: { $in: [departmentId] },
        receivingBatches: { $in: [batchId] },
      });
    }
  }

  const notices = await NoticeModel.find({
    $or: conditionalQueries,
  })
    .select(
      'noticeTitle noticeBody noticeFile createdAt updatedAt isUrgent receivingBatches receivingDepartments targetType receivingCourse'
    )
    .populate({
      path: 'receivingCourse',
      select: 'courseName',
    })
    .sort('-updatedAt');

  const enrichedNotices = await attachReceiverDetails(notices);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notices found!',
    notices: enrichedNotices,
    lastNoticeFetched,
  });

  student.lastNoticeFetched = new Date();
  await student.save();
};

async function attachReceiverDetails(notices) {
  if (!Array.isArray(notices) || !notices.length) return notices;

  const courseIds = [
    ...new Set(
      notices
        .filter((notice) => notice.receivingCourse)
        .map((notice) => String(notice.receivingCourse._id ?? notice.receivingCourse))
    ),
  ];

  if (!courseIds.length) return notices;

  const courses = await CourseModel.find({ _id: { $in: courseIds } })
    .select('courseName batches departments')
    .lean();

  const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));

  return notices.map((notice) => {
    const noticeObj = notice.toObject ? notice.toObject() : { ...notice };
    const courseId = String(noticeObj.receivingCourse?._id ?? noticeObj.receivingCourse);
    const course = courseMap.get(courseId);

    if (!course) return noticeObj;

    const departments = Array.isArray(noticeObj.receivingDepartments)
      ? noticeObj.receivingDepartments
          .map((deptId) => {
            const key = String(deptId);
            const dept = course.departments?.[key] ?? course.departments?.get?.(key);
            return dept ? { departmentName: dept.departmentName } : null;
          })
          .filter(Boolean)
      : [];

    const batches = Array.isArray(noticeObj.receivingBatches)
      ? noticeObj.receivingBatches
          .map((batchId) => {
            const key = String(batchId);
            const batch = course.batches?.[key] ?? course.batches?.get?.(key);
            return batch ? { batchYear: batch.batchYear } : null;
          })
          .filter(Boolean)
      : [];

    return {
      ...noticeObj,
      receivingCourse: { courseName: course.courseName, _id: course._id },
      receivingDepartments: departments,
      receivingBatches: batches,
    };
  });
}

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
      const department = course.departments.get(String(receivingDepartment));
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
      const batch = course.batches.get(String(receivingBatch));
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
      const batch = course.batches.get(String(receivingBatch));
      if (!batch) {
        throw new CustomAPIError.BadRequestError(
          `No batch found with id: ${receivingBatch}`
        );
      }
      validBatches.push(batch);
    }

    for (let receivingDepartment of departments) {
      const department = course.departments.get(String(receivingDepartment));
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
