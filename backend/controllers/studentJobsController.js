const JobOpeningModel = require('../models/JobOpenings');
const UserModel = require('../models/User');
const PersonalDataModel = require('../models/student/PersonalData');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { fileUpload, checkAcademicEligibility } = require('../utils');

const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  singleJobStudentAgg,
  studentJobApplicationsAgg,
} = require('../models/aggregations/');
const JobApplicationModel = require('../models/JobApplication');
const { EducationModel } = require('../models/student');
const OfferModel = require('../models/Offer');

const getJobsForStudent = async (req, res) => {
  const status = req?.query?.status?.toLowerCase() || 'open';
  const validStatus = ['open', 'applied', 'shortlisted', 'rejected', 'hired'];

  if (!status?.trim() || !validStatus.includes(status)) {
    throw new CustomAPIError.BadRequestError('Invalid job status');
  }

  const { batchId, departmentId, courseId, userId } = req.user;

  let jobs;
  if (status === 'open') {
    jobs = await JobOpeningModel.aggregate(
      studentJobOpeningsAgg({
        batchId,
        courseId,
        departmentId,
        userId,
      })
    );
  } else {
    jobs = await UserModel.aggregate(
      studentJobsByStatusAgg({ userId, status })
    );
  }

  const student = await UserModel.findById(userId);
  const studentEducation = await EducationModel.findOne({ studentId: userId });
  const studentPersonal = await PersonalDataModel.findOne({ studentId: userId });
  const userSkills = (student.skills || []).map((s) => s.toLowerCase().trim());

  jobs = jobs.map((job) => {
    let requiredSkills = job.keySkills || [];
    let matchScore = 0;
    let matchedSkills = [];
    let missingSkills = [];

    if (requiredSkills.length > 0) {
      if (userSkills.length > 0) {
        requiredSkills.forEach((rSkill) => {
          if (userSkills.includes(rSkill.toLowerCase().trim())) {
            matchedSkills.push(rSkill);
          } else {
            missingSkills.push(rSkill);
          }
        });
        matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      } else {
        missingSkills = [...requiredSkills];
        matchScore = 0;
      }
    } else {
      matchScore = 'N/A';
    }

    let eligibilityStatus = { isEligible: true, reasons: [] };
    if (job.enableEligibilityFilter && job.eligibilityCriteria) {
      if (!studentEducation) {
        eligibilityStatus = {
          isEligible: false,
          reasons: ['Your education details are incomplete. Please update your profile.'],
        };
      } else {
        eligibilityStatus = checkAcademicEligibility(
          studentEducation,
          job.eligibilityCriteria,
          studentPersonal,
          student
        );
      }
    }

    return {
      ...job,
      matchFeature: {
        matchScore,
        matchedSkills,
        missingSkills,
      },
      eligibilityStatus,
    };
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Jobs found!',
    jobs,
    hiredStatus: student.hiredStatus,
    hiredJobId: student.hiredJobId,
  });

  student.lastJobFetched = new Date();
  await student.save();
};

const getStudentJobById = async (req, res) => {
  const jobId = req?.params?.jobId;
  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  const { batchId, departmentId, courseId, userId } = req.user;

  const job = (
    await JobOpeningModel.aggregate(
      singleJobStudentAgg({ jobId, userId, batchId, departmentId, courseId })
    )
  )?.[0];

  if (!job)
    throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);

  const student = await UserModel.findById(userId);
  const studentPersonal = await PersonalDataModel.findOne({ studentId: userId });
  const userSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
  
  let requiredSkills = job.keySkills || [];
  let matchScore = 0;
  let matchedSkills = [];
  let missingSkills = [];

  if (requiredSkills.length > 0) {
    if (userSkills.length > 0) {
      requiredSkills.forEach((rSkill) => {
        if (userSkills.includes(rSkill.toLowerCase().trim())) {
          matchedSkills.push(rSkill);
        } else {
          missingSkills.push(rSkill);
        }
      });
      matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    } else {
      missingSkills = [...requiredSkills];
      matchScore = 0;
    }
  } else {
    matchScore = 'N/A';
  }

  // Check eligibility if filter is enabled
  let eligibilityStatus = { isEligible: true, reasons: [] };
  if (job.enableEligibilityFilter && job.eligibilityCriteria) {
    const studentEducation = await EducationModel.findOne({
      studentId: userId,
    });
    eligibilityStatus = checkAcademicEligibility(
      studentEducation,
      job.eligibilityCriteria,
      studentPersonal,
      student
    );
  }

  const jobWithMatch = {
    ...job,
    matchFeature: {
      matchScore,
      matchedSkills,
      missingSkills,
    },
    eligibilityStatus,
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job found!',
    job: jobWithMatch,
  });
};

const createJobApplication = async (req, res) => {
  const { portfolio, coverLetter } = req?.body;
  const resumeFile = req?.files?.resumeFile;
  const jobId = req?.params?.id;
  const {
    userId: applicantId,
    name: applicantName,
    courseId,
    departmentId,
    batchId,
  } = req.user;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  if (!portfolio?.trim() || !coverLetter?.trim() || !resumeFile)
    throw new CustomAPIError.BadRequestError(
      'Portfolio, Cover letter & Resume are required!'
    );

  /* VALIDATE JOB & APPLICANT */

  const applicant = await UserModel.findById(applicantId);
  if (!applicant) throw new CustomAPIError.BadRequestError('Invalid user!');

  const applicantPersonal = await PersonalDataModel.findOne({ studentId: applicantId });

  // Check if student is already hired
  if (applicant.hiredStatus !== 'none') {
    throw new CustomAPIError.BadRequestError(
      'You are already hired and cannot apply for new jobs.'
    );
  }

  const job = await JobOpeningModel.findById(jobId);

  const now = new Date();
  if (new Date(job.deadline) < now) {
    job.status = 'closed';
    await job.save();
    throw new CustomAPIError.BadRequestError(
      'Deadline passed. You can no longer apply for this job.'
    );
  }

  if (job.status !== 'open')
    throw new CustomAPIError.BadRequestError("This job isn't open anymore!");

  if (
    job.applicants.includes(applicantId) ||
    job.rejectedCandidates.includes(applicantId) ||
    job.shortlistedCandidates.includes(applicantId) ||
    job.selectedCandidates.includes(applicantId)
  )
    throw new CustomAPIError.BadRequestError(
      'You have already applied for this job!'
    );

  const validDeptIds = job.receivingDepartments.map((dept) =>
    dept.id.toString()
  );

  if (
    job.receivingCourse.id.toString() !== courseId ||
    job.receivingBatch.id.toString() !== batchId ||
    !validDeptIds.includes(departmentId)
  )
    throw new CustomAPIError.BadRequestError("You can't apply for this job!");

  // Check eligibility if filter is enabled
  if (job.enableEligibilityFilter && job.eligibilityCriteria) {
    const studentEducation = await EducationModel.findOne({
      studentId: applicantId,
    });

    if (!studentEducation) {
      throw new CustomAPIError.BadRequestError(
        'Your education details are not complete. Please update your profile first.'
      );
    }

    const eligibilityStatus = checkAcademicEligibility(
      studentEducation,
      job.eligibilityCriteria,
      applicantPersonal,
      applicant
    );

    if (!eligibilityStatus.isEligible) {
      const reasonsMessage = eligibilityStatus.reasons.join(' | ');
      throw new CustomAPIError.BadRequestError(
        `You are not eligible for this job. Reason: ${reasonsMessage}`
      );
    }
  }

  /* END VALIDATION */

  const fileUploadResp = await fileUpload(resumeFile, 'resumes', 'document');
  const resume = fileUploadResp?.fileURL;

  const jobApplication = await JobApplicationModel.create({
    jobId,
    applicantId,
    applicantName,
    coverLetter,
    portfolio,
    resume,
    companyId: job.company.id,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Job Application Created!',
    id: jobApplication._id,
  });

  job.applicants.push(applicantId);
  job.applications.push(jobApplication._id);
  await job.save();

  applicant.jobsApplied.push(jobId);
  applicant.jobApplications.push(jobApplication._id);
  await applicant.save();
};

const getApplications = async (req, res) => {
  const applicantId = req?.user?.userId;
  const applications = await JobApplicationModel.aggregate(
    studentJobApplicationsAgg({ applicantId })
  );
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'found applications',
    applications,
  });
};

const getOfferStatus = async (req, res) => {
  const userId = req.user.userId;

  const offer = await OfferModel.findOne({ studentId: userId }).populate('jobApplicationId');
  if (!offer) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'No offer found',
      offer: null,
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Offer found',
    offer: {
      id: offer._id,
      status: offer.status,
      offerLetter: offer.offerLetter,
      offerLetterUploadedAt: offer.offerLetterUploadedAt,
      jobTitle: offer.jobApplicationId ? 'Job Position' : 'Position', // You might want to populate job details
      companyName: 'Company Name', // Populate from job/company
    },
  });
};

const acceptOffer = async (req, res) => {
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user || user.hiredStatus !== 'pending_offer') {
    throw new CustomAPIError.BadRequestError('No pending offer to accept');
  }

  const offer = await OfferModel.findOne({ studentId: userId });
  if (!offer || offer.status !== 'pending') {
    throw new CustomAPIError.BadRequestError('No pending offer to accept');
  }

  offer.status = 'accepted';
  offer.acceptedAt = new Date();
  await offer.save();

  user.hiredStatus = 'accepted';
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Offer accepted successfully',
  });
};

const rejectOffer = async (req, res) => {
  const userId = req.user.userId;

  const user = await UserModel.findById(userId);
  if (!user || user.hiredStatus !== 'pending_offer') {
    throw new CustomAPIError.BadRequestError('No pending offer to reject');
  }

  const offer = await OfferModel.findOne({ studentId: userId });
  if (!offer || offer.status !== 'pending') {
    throw new CustomAPIError.BadRequestError('No pending offer to reject');
  }

  offer.status = 'rejected';
  offer.rejectedAt = new Date();
  await offer.save();

  user.hiredStatus = 'rejected';
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Offer rejected',
  });
};

module.exports = {
  getJobsForStudent,
  createJobApplication,
  getStudentJobById,
  getApplications,
  getOfferStatus,
  acceptOffer,
  rejectOffer,
};
