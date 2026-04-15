const UserModel = require('../models/User');

const {
  PersonalDataModel,
  EducationModel,
  CurrentScoreModel,
  PastScoreModel,
  PlacementModel,
  ExperienceModel,
  TrainingModel,
} = require('../models/student');

const { studentProfileDetailsAgg } = require('../models/aggregations');

const CustomAPIError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const {
  fileUpload,
  validateModelDoc,
  createUserToken,
  attachCookieToResponse,
} = require('../utils');

const getPersonalData = async (req, res) => {
  const studentId = req.user.userId;

  const personalDetails = await PersonalDataModel.findOne({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Pesonal details found!',
    personalDetails,
  });
};

const updatePersonalData = async (req, res) => {
  const {
    fatherName,
    motherName,
    contactNumber,
    locality,
    city,
    pincode,
    district,
    state,
    dateOfBirth,
    activeBacklogs,
    completedBacklogs,
  } = req.body;

  const studentId = req.user.userId;

  let photoFile = req?.files?.photo;
  if (Array.isArray(photoFile)) {
    photoFile = photoFile[0];
  }

  let photo = null;
  if (photoFile) {
    const fileUploadResp = await fileUpload(photoFile, 'photos', 'image');
    photo = fileUploadResp?.fileURL;
  }

  const updatePayload = { studentId };
  if (fatherName !== undefined) updatePayload.fatherName = fatherName;
  if (motherName !== undefined) updatePayload.motherName = motherName;
  if (contactNumber !== undefined) updatePayload.contactNumber = contactNumber;
  if (dateOfBirth !== undefined) updatePayload.dateOfBirth = dateOfBirth;

  const addressPayload = {};
  if (locality !== undefined) addressPayload.locality = locality;
  if (city !== undefined) addressPayload.city = city;
  if (pincode !== undefined) addressPayload.pincode = pincode;
  if (district !== undefined) addressPayload.district = district;
  if (state !== undefined) addressPayload.state = state;
  if (Object.keys(addressPayload).length) {
    updatePayload.address = addressPayload;
  }

  const personalDataDoc = await PersonalDataModel.findOneAndUpdate(
    { studentId },
    updatePayload,
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  const student = await UserModel.findById(studentId);
  if (!student.personalDetails) {
    student.personalDetails = personalDataDoc._id;
  }
  if (photo) {
    student.photo = photo;
  }
  if (activeBacklogs !== undefined) {
    const activeBacklogsNum = parseInt(activeBacklogs, 10);
    if (isNaN(activeBacklogsNum) || activeBacklogsNum < 0) {
      throw new CustomAPIError.BadRequestError('Active backlogs must be a non-negative number');
    }
    student.activeBacklogs = activeBacklogsNum;
  }
  if (completedBacklogs !== undefined) {
    const completedBacklogsNum = parseInt(completedBacklogs, 10);
    if (isNaN(completedBacklogsNum) || completedBacklogsNum < 0) {
      throw new CustomAPIError.BadRequestError('Completed backlogs must be a non-negative number');
    }
    student.completedBacklogs = completedBacklogsNum;
  }
  await student.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated Personal Details',
    photo: student.photo,
  });
};

const getEducationData = async (req, res) => {
  const studentId = req.user.userId;

  const educationDetails = await EducationModel.findOne({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Education Details found!',
    educationDetails,
  });
};

const updateEducationData = async (req, res) => {
  const update = req?.params?.update;
  const validUpdates = [
    'highschool',
    'intermediate',
    'diploma',
    'graduation',
    'postGraduation',
  ];

  if (!validUpdates.includes(update))
    throw new CustomAPIError.BadRequestError('Invalid update request!');

  const userId = req?.user?.userId;

  const student = await UserModel.findById(userId);
  if (!student) throw new CustomAPIError.BadRequestError('Invalid student');

  const {
    _id: studentId,
    courseLevel,
    isLateralEntry,
    semestersCount,
  } = student;

  let lastErrorObject;

  /* HIGHSCHOOL, INTER & DIPLOMA UPDATE */
  if (
    update === 'highschool' ||
    update === 'intermediate' ||
    update === 'diploma'
  ) {
    lastErrorObject = await updatePastEducationRecord(
      {
        ...req.body,
        courseLevel,
        isLateralEntry,
        studentId,
      },
      update
    );
  } else if (update === 'graduation') {
    /* GRADUATION UPDATE */
    if (courseLevel === 'graduation')
      lastErrorObject = await updateCurrentScoreRecord(
        {
          ...req.body,
          courseLevel,
          isLateralEntry,
          studentId,
          semestersCount,
        },
        update
      );
    else if (courseLevel === 'postGraduation')
      lastErrorObject = await updatePastEducationRecord(
        {
          ...req.body,
          courseLevel,
          isLateralEntry,
          studentId,
        },
        update
      );
  } else if (update === 'postGraduation') {
    /* POST GRADUATION UPDATE */

    if (courseLevel === 'graduation')
      throw new CustomAPIError.BadRequestError(
        'Post Graduation Data is not allowed!'
      );

    lastErrorObject = await updateCurrentScoreRecord({
      ...req.body,
      courseLevel,
      isLateralEntry,
      studentId,
      semestersCount,
    });
  }

  const { updatedExisting, upserted } = lastErrorObject;
  if (!updatedExisting) {
    student.educationDetails = upserted;
    await student.save();
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Education Record Updated!',
  });
};

const deletePastEducation = async (req, res) => {
  const studentId = req?.user?.userId;
  const field = req?.params?.field;

  const validFields = ['highschool', 'intermediate', 'diploma', 'graduation'];

  if (!field?.trim() || !validFields.includes(field))
    throw new CustomAPIError.BadRequestError('Invalid field provided!');

  const educationDetails = await EducationModel.findOne({ studentId });

  if (!educationDetails) throw new CustomAPIError('No education record found!');

  if (
    field === 'graduation' &&
    educationDetails.courseLevel !== 'postGraduation'
  )
    throw new CustomAPIError.BadRequestError('Invalid field provided!');

  await EducationModel.findByIdAndUpdate(educationDetails._id, {
    $unset: { [field]: '' },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Deleted ${field} data`,
  });
};

const getExperiences = async (req, res) => {
  const studentId = req.user.userId;

  const experiences = await ExperienceModel.find({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experiences found!',
    experiences,
  });
};

const getExperienceById = async (req, res) => {
  const id = req?.params?.id;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const experience = await ExperienceModel.findById(id);

  if (!experience)
    throw new CustomAPIError.NotFoundError(
      `No experience found with id: ${id}`
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Experience found with id: ${id}`,
    experience,
  });
};

const createExperience = async (req, res) => {
  const studentId = req.user.userId;
  let { jobProfile, company, startDate, endDate } = req.body;

  if (!startDate) {
    throw new CustomAPIError.BadRequestError('Start Date is required!');
  }

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid Start Date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid End Date!');
  }

  const experience = await ExperienceModel.create({
    studentId,
    jobProfile,
    company,
    startDate,
    endDate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'New Experience created!',
    id: experience._id,
  });

  const student = await UserModel.findById(studentId);
  student.experiences.push(experience._id);
  await student.save();
};

const updateExperience = async (req, res) => {
  const studentId = req.user.userId;
  const id = req?.params?.id;

  let { jobProfile, company, startDate, endDate } = req.body;

  if (!id?.trim()) {
    throw new CustomAPIError.BadRequestError('Experience Id is required');
  }

  const experience = await ExperienceModel.findById(id);

  if (!experience) {
    throw new CustomAPIError.NotFoundError(
      `No experience found with id: ${id}`
    );
  }

  if (experience.studentId != studentId && req.user.role !== 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not authorized to perform this action'
    );
  }

  if (startDate) {
    startDate = new Date(startDate);
    if (startDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid Start Date!');
  }

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid End Date!');
  }

  await ExperienceModel.findByIdAndUpdate(
    experience._id,
    {
      jobProfile,
      company,
      startDate,
      endDate,
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experience updated!',
    id,
  });
};

const deleteExperience = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const experience = await ExperienceModel.findById(id);

  if (!experience)
    throw new CustomAPIError.NotFoundError(`No Experience found with ${id}`);

  if (
    experience.studentId.toString() != studentId &&
    req.user.role != 'admin'
  ) {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  await ExperienceModel.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Experience deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.experiences = student.experiences.filter(
    (ele) => ele.toString() !== id
  );
  await student.save();
};

const createPlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
  const studentId = req.user.userId;

  if (joiningDate) {
    joiningDate = new Date(joiningDate);
    if (joiningDate == 'Invalid Date') {
      throw new CustomAPIError.BadRequestError('Invalid joining date!');
    }
  }

  if (offerLetter) {
    const fileUploadResp = await fileUpload(
      offerLetter,
      'offer-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    offerLetter = fileURL;
  }

  if (joiningLetter) {
    if (!joiningDate)
      throw new CustomAPIError.BadRequestError('Joining Date is required!');

    const fileUploadResp = await fileUpload(
      joiningLetter,
      'joining-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  const student = await UserModel.findById(studentId);

  const placement = await PlacementModel.create({
    studentId,
    jobProfile,
    company,
    location,
    departmentName: student?.departmentName,
    package,
    joiningDate,
    offerLetter,
    joiningLetter,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'New Placement created!',
    id: placement._id,
  });

  student.placements.push(placement._id);
  await student.save();
};

const getPlacements = async (req, res) => {
  const studentId = req.user.userId;

  const placements = await PlacementModel.find({ studentId });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Placements found!',
    placements,
  });
};

const getPlacementById = async (req, res) => {
  const id = req?.params?.id;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);
  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Placement found with id: ${id}`,
    placement,
  });
};

const updatePlacement = async (req, res) => {
  let { jobProfile, company, location, package, joiningDate } = req.body;
  let offerLetter = req?.files?.offerLetter;
  let joiningLetter = req?.files?.joiningLetter;
  const studentId = req.user.userId;
  const id = req?.params?.id;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);

  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with id: ${id}`);

  if (placement.isOnCampus)
    throw new CustomAPIError.BadRequestError(
      "Can't update an on-campus placement"
    );

  if (placement.studentId.toString() != studentId && req.user.role != 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  if (joiningDate) {
    joiningDate = new Date(joiningDate);
    if (joiningDate == 'Invalid Date') {
      throw new CustomAPIError.BadRequestError('Invalid joining date!');
    }
  }

  if (offerLetter) {
    const fileUploadResp = await fileUpload(
      offerLetter,
      'offer-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    offerLetter = fileURL;
  }

  if (joiningLetter) {
    if (!joiningDate)
      throw new CustomAPIError.BadRequestError('Joining Date is required!');

    const fileUploadResp = await fileUpload(
      joiningLetter,
      'joining-letters',
      'document'
    );
    const { fileURL } = fileUploadResp;
    joiningLetter = fileURL;
  }

  await PlacementModel.findByIdAndUpdate(
    id,
    {
      jobProfile,
      company,
      location,
      package,
      joiningDate,
      offerLetter,
      joiningLetter,
    },
    { runValidators: true }
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Placement Updated!',
    id,
  });
};

const deletePlacement = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const placement = await PlacementModel.findById(id);

  if (!placement)
    throw new CustomAPIError.NotFoundError(`No placement found with ${id}`);

  if (placement.isOnCampus)
    throw new CustomAPIError.BadRequestError(
      "Can't delete an on-campus placement"
    );

  if (placement.studentId.toString() != studentId && req.user.role != 'admin') {
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to perform this action'
    );
  }

  await PlacementModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Placement deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.placements = student.placements.filter(
    (ele) => ele.toString() !== id
  );
  await student.save();
};

const createTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  const studentId = req.user.userId;
  let certificate = req?.files?.certificate;

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid start date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid end date!');
  }

  if (certificate) {
    if (!endDate)
      throw new CustomAPIError.BadRequestError('End Date is required!');

    const fileUploadResp = await fileUpload(
      certificate,
      'training_certificates',
      'document'
    );
    const { fileURL } = fileUploadResp;
    certificate = fileURL;
  }

  const training = await TrainingModel.create({
    studentId,
    trainingName,
    organisation,
    startDate,
    endDate,
    certificate,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Training Created!',
    id: training._id,
  });

  const student = await UserModel.findById(studentId);
  student.trainings.push(training._id);
  await student.save();
};

const getTrainings = async (req, res) => {
  const studentId = req.user.userId;
  const trainings = await TrainingModel.find({ studentId });
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found trainings!',
    trainings,
  });
};

const getTrainingById = async (req, res) => {
  const id = req?.params?.id;
  const studentId = req.user.userId;
  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({
    _id: id,
    studentId,
  });

  if (!training)
    throw new CustomAPIError.NotFoundError(`No Training found with id: ${id}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Training found with id: ${id}`,
    training,
  });
};

const updateTraining = async (req, res) => {
  let { trainingName, organisation, startDate, endDate } = req.body;
  let certificate = req?.files?.certificate;
  const studentId = req.user.userId;
  const id = req?.params?.id;

  startDate = new Date(startDate);
  if (startDate == 'Invalid Date')
    throw new CustomAPIError.BadRequestError('Invalid start date!');

  if (endDate) {
    endDate = new Date(endDate);
    if (endDate == 'Invalid Date')
      throw new CustomAPIError.BadRequestError('Invalid end date!');
  }

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({
    _id: id,
    studentId,
  });

  if (!training)
    throw new CustomAPIError.NotFoundError(`No training found with id: ${id}`);

  if (certificate) {
    if (!endDate)
      throw new CustomAPIError.BadRequestError('End Date is required!');

    const fileUploadResp = await fileUpload(
      certificate,
      'training_certificates',
      'document'
    );
    const { fileURL } = fileUploadResp;
    certificate = fileURL;
  }

  await TrainingModel.findByIdAndUpdate(
    id,
    {
      trainingName,
      organisation,
      startDate,
      endDate,
      certificate,
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Training Updated!',
    id,
  });
};

const deleteTraining = async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.userId;

  if (!id?.trim()) throw new CustomAPIError.BadRequestError('Id is required!');

  const training = await TrainingModel.findOne({ _id: id, studentId });
  if (!training) {
    throw new CustomAPIError.NotFoundError(`No Training found with ${id}`);
  }

  await TrainingModel.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Training deleted!',
    id,
  });

  const student = await UserModel.findById(studentId);
  student.trainings = student.trainings.filter((ele) => ele.toString() !== id);
  await student.save();
};

const getStudentProfile = async (req, res) => {
  const studentId = req?.user?.userId;
  const profileDetails = (
    await UserModel.aggregate(studentProfileDetailsAgg(studentId, true))
  )[0];
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile Details Found!',
    profileDetails,
  });
};

const getSkills = async (req, res) => {
  const studentId = req?.user?.userId;

  const skills = await UserModel.findById(studentId).select('skills');

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found skills!',
    skills: skills.skills,
  });
};

const addSkill = async (req, res) => {
  const studentId = req?.user?.userId;
  const skill = req?.body?.skill?.trim();
  if (!skill) throw new CustomAPIError.BadRequestError('Skill is required!');

  await UserModel.findByIdAndUpdate(
    studentId,
    {
      $addToSet: { skills: skill },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Added skill!',
  });
};

const updateSkill = async (req, res) => {
  const studentId = req?.user?.userId;
  const { oldSkill, updatedSkill } = req?.body;

  if (!oldSkill?.trim())
    throw new CustomAPIError.BadRequestError('Invalid old skill!');

  if (!updatedSkill?.trim())
    throw new CustomAPIError.BadRequestError('Invalid updated skill!');

  await UserModel.findOneAndUpdate(
    { _id: studentId, skills: oldSkill },
    {
      $set: {
        'skills.$': updatedSkill,
      },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated skill!',
  });
};

const deleteSkill = async (req, res) => {
  const studentId = req?.user?.userId;
  const skill = req?.body?.skill?.trim();
  if (!skill) throw new CustomAPIError.BadRequestError('Skill is required!');

  await UserModel.findByIdAndUpdate(
    studentId,
    {
      $pull: { skills: skill },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Deleted skill!',
  });
};

const getAchievements = async (req, res) => {
  const studentId = req?.user?.userId;

  const achievements = await UserModel.findById(studentId).select(
    'achievements'
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found achievements!',
    achievements: achievements.achievements,
  });
};

const addAchievement = async (req, res) => {
  const studentId = req?.user?.userId;
  const achievement = req?.body?.achievement?.trim();
  if (!achievement)
    throw new CustomAPIError.BadRequestError('Achievement is required!');

  await UserModel.findByIdAndUpdate(
    studentId,
    {
      $addToSet: { achievements: achievement },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Added achievement!',
  });
};

const updateAchievement = async (req, res) => {
  const studentId = req?.user?.userId;
  const { oldAchievement, updatedAchievement } = req?.body;

  if (!oldAchievement?.trim())
    throw new CustomAPIError.BadRequestError('Invalid old achievement!');

  if (!updatedAchievement?.trim())
    throw new CustomAPIError.BadRequestError('Invalid updated achievement!');

  await UserModel.findOneAndUpdate(
    { _id: studentId, achievements: oldAchievement },
    {
      $set: {
        'achievements.$': updatedAchievement,
      },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated achievement!',
  });
};

const deleteAchievement = async (req, res) => {
  const studentId = req?.user?.userId;
  const achievement = req?.body?.achievement?.trim();
  if (!achievement)
    throw new CustomAPIError.BadRequestError('Achievement is required!');

  await UserModel.findByIdAndUpdate(
    studentId,
    {
      $pull: { achievements: achievement },
    },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Deleted achievement!',
  });
};

async function updatePastEducationRecord(data, label) {
  const {
    studentId,
    courseLevel,
    isLateralEntry,
    year,
    scale,
    score,
    institute,
    board,
    stream,
  } = data;

  const doc = new PastScoreModel({
    year,
    scale,
    score,
    institute,
    board,
    stream,
  });

  validateModelDoc(doc, `Invalid ${label} data`);

  const { lastErrorObject } = await EducationModel.findOneAndUpdate(
    { studentId },
    {
      studentId,
      isLateralEntry,
      courseLevel,
      [label]: doc,
    },
    { upsert: true, runValidators: true, rawResult: true }
  );

  return lastErrorObject;
}

async function updateCurrentScoreRecord(data, label) {
  const {
    studentId,
    isLateralEntry,
    courseLevel,
    scores,
    semestersCount,
    aggregateGPA,
  } = data;

  const doc = new CurrentScoreModel({
    semestersCount,
    scores,
    aggregateGPA,
  });

  validateModelDoc(doc, `Invalid ${label} data`);

  const { lastErrorObject } = await EducationModel.findOneAndUpdate(
    { studentId },
    {
      studentId,
      isLateralEntry,
      courseLevel,
      [label]: doc,
    },
    { upsert: true, runValidators: true, rawResult: true }
  );

  return lastErrorObject;
}

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.userId;

  if (!oldPassword?.trim()) {
    throw new CustomAPIError.BadRequestError('Old password is required');
  }
  if (!newPassword?.trim()) {
    throw new CustomAPIError.BadRequestError('New password is required');
  }
  if (!confirmPassword?.trim()) {
    throw new CustomAPIError.BadRequestError('Confirm password is required');
  }

  if (newPassword !== confirmPassword) {
    throw new CustomAPIError.BadRequestError(
      'New password and confirm password do not match'
    );
  }

  if (newPassword.length < 8) {
    throw new CustomAPIError.BadRequestError(
      'Password must be at least 8 characters long'
    );
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomAPIError.NotFoundError('User not found');
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomAPIError.BadRequestError('Old password is incorrect');
  }

  user.password = newPassword;
  user.forcePasswordReset = false;
  await user.save();

  const userToken = createUserToken(user);
  attachCookieToResponse(res, userToken);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password changed successfully',
  });
};

module.exports = {
  getEducationData,
  updateEducationData,
  deletePastEducation,

  getPersonalData,
  updatePersonalData,
  getStudentProfile,

  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,

  createPlacement,
  getPlacements,
  getPlacementById,
  updatePlacement,
  deletePlacement,

  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,

  addSkill,
  deleteSkill,
  getSkills,
  updateSkill,

  addAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievements,

  changePassword,
};
