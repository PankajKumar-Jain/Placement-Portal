const JobOpeningModel = require('../models/JobOpenings');
const CompanyModel = require('../models/Company');
const JobApplicationModel = require('../models/JobApplication');
const OfferModel = require('../models/Offer');

const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('../errors');

const { validateJobReceivers } = require('../utils');

const {
  jobApplicationsAgg,
  jobApplicationsAggWithFilters,
  companyInchargeJobsAgg,
  studentProfileDetailsAgg,
  singleJobCompanyAgg,
  singleJobApplicationsAgg,
} = require('../models/aggregations');
const UserModel = require('../models/User');

const { fileUpload } = require('../utils');
const { PlacementModel } = require('../models/student');

const createJobOpening = async (req, res) => {
  const {
    profile,
    description,
    location,
    jobPackage,
    receivingCourse,
    receivingBatch,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
    cgpaCutoff,
    enableEligibilityFilter,
    tenthPercentage,
    twelfthPercentage,
    diplomaPercentage,
    graduationPercentage,
    graduationCGPA,
    maxActiveBacklogs,
    maxCompletedBacklogs,
    maxDOB,
  } = req.body;

  const { userId, companyId } = req.user;

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);
  const companyAdmin = await UserModel.findById(userId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to access this resource'
    );

  // Validate eligibility criteria if filter is enabled
  if (enableEligibilityFilter === 'true' || enableEligibilityFilter === true) {
    const hasCriteria =
      tenthPercentage ||
      twelfthPercentage ||
      diplomaPercentage ||
      graduationPercentage ||
      graduationCGPA ||
      maxActiveBacklogs ||
      maxCompletedBacklogs ||
      maxDOB;
    
    if (!hasCriteria) {
      throw new CustomAPIError.BadRequestError(
        'Please set at least one eligibility criterion!'
      );
    }

    // Validate percentage and CGPA values
    const validatePercentage = (val) => {
      if (!val && val !== 0) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    };

    const validateCGPA = (val) => {
      if (!val && val !== 0) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 10;
    };

    const validateBacklogs = (val) => {
      if (!val && val !== 0) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    };

    const validateDate = (val) => {
      if (!val) return true;
      const dateValue = new Date(val);
      return !Number.isNaN(dateValue.getTime());
    };

    if (
      !validatePercentage(tenthPercentage) ||
      !validatePercentage(twelfthPercentage) ||
      !validatePercentage(diplomaPercentage) ||
      !validatePercentage(graduationPercentage) ||
      !validateCGPA(graduationCGPA) ||
      !validateBacklogs(maxActiveBacklogs) ||
      !validateBacklogs(maxCompletedBacklogs) ||
      !validateDate(maxDOB)
    ) {
      throw new CustomAPIError.BadRequestError(
        'Invalid eligibility criteria values. Percentages must be 0-100, CGPA must be 0-10, backlogs must be non-negative, and date of birth must be valid.'
      );
    }
  }

  const { course, batch, departments } = await validateJobReceivers({
    receivingCourse,
    receivingBatch,
    receivingDepartments,
  });

  const eligibilityCriteria =
    enableEligibilityFilter === 'true' || enableEligibilityFilter === true
      ? {
          tenthPercentage: tenthPercentage ? Number(tenthPercentage) : null,
          twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : null,
          diplomaPercentage: diplomaPercentage ? Number(diplomaPercentage) : null,
          graduationPercentage: graduationPercentage ? Number(graduationPercentage) : null,
          graduationCGPA: graduationCGPA ? Number(graduationCGPA) : null,
        }
      : {};

  const openingsCountValue = Number(openingsCount);
  if (Number.isNaN(openingsCountValue) || openingsCountValue < 1) {
    throw new CustomAPIError.BadRequestError(
      'Opening Count must be a number greater than 0'
    );
  }

  const jobOpening = await JobOpeningModel.create({
    profile,
    description,
    location,
    company: {
      id: company._id,
      name: company.name,
      website: company.website,
    },
    jobPackage,
    receivingCourse: { id: course._id, courseName: course.courseName },
    receivingBatch: batch,
    receivingDepartments: departments,
    keySkills,
    postedBy: {
      id: companyAdmin._id,
      name: companyAdmin.name,
    },
    openingsCount: openingsCountValue,
    deadline,
    cgpaCutoff,
    enableEligibilityFilter: enableEligibilityFilter === 'true' || enableEligibilityFilter === true,
    eligibilityCriteria,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created Job Opening',
    id: jobOpening._id,
  });

  course.lastJobOpening = jobOpening.createdAt;

  course.batches
    .get(receivingBatch)
    .set('lastJobOpening', jobOpening.createdAt);

  for (let receivingDepartment of receivingDepartments) {
    course.departments
      .get(receivingDepartment)
      .set('lastJobOpening', jobOpening.createdAt);
  }
  await course.save();

  // Increment company stats
  company.jobsPosted = (company.jobsPosted || 0) + 1;
  company.openingsCreated = (company.openingsCreated || 0) + openingsCountValue;
  await company.save();
};

const getJobsForIncharge = async (req, res) => {
  const { companyId, userId } = req.user;
  const status = req?.query?.status || 'open';

  const validStatus = ['open', 'expired'];
  if (!validStatus.includes(status)) {
    throw new CustomAPIError.BadRequestError('Invalid status');
  }

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (!company.admins.includes(userId))
    throw new CustomAPIError.BadRequestError(
      `Not allowed to access this resource!`
    );

  const jobs = await JobOpeningModel.aggregate(
    companyInchargeJobsAgg({ companyId, status })
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job openings!',
    jobs,
  });
};

const getSingleJob = async (req, res) => {
  const jobId = req?.params?.jobId;
  const companyId = req?.user?.companyId;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job is required!');

  const job = (
    await JobOpeningModel.aggregate(
      singleJobCompanyAgg({
        companyId,
        jobId,
      })
    )
  )?.[0];

  if (!job)
    throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found job',
    job,
  });
};

const updateJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  const { userId, companyId } = req.user;

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  if (!companyId?.trim())
    throw new CustomAPIError.BadRequestError('Company is required!');

  const company = await CompanyModel.findById(companyId);
  const companyAdmin = await UserModel.findById(userId);

  if (!company)
    throw new CustomAPIError.BadRequestError(
      `No company is found with id: ${companyId}`
    );

  if (companyAdmin.companyId != companyId)
    throw new CustomAPIError.UnauthorizedError(
      'Not allowed to access this resource'
    );

  const {
    profile,
    description,
    location,
    jobPackage,
    receivingCourse,
    receivingBatch,
    receivingDepartments,
    keySkills,
    openingsCount,
    deadline,
    cgpaCutoff,
    enableEligibilityFilter,
    tenthPercentage,
    twelfthPercentage,
    diplomaPercentage,
    graduationPercentage,
    graduationCGPA,
  } = req.body;

  // Validate eligibility criteria if filter is enabled
  if (enableEligibilityFilter === 'true' || enableEligibilityFilter === true) {
    const hasCriteria = tenthPercentage || twelfthPercentage || diplomaPercentage || graduationPercentage || graduationCGPA;
    
    if (!hasCriteria) {
      throw new CustomAPIError.BadRequestError(
        'Please set at least one eligibility criterion!'
      );
    }

    // Validate percentage and CGPA values
    const validatePercentage = (val) => {
      if (!val && val !== 0) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    };

    const validateCGPA = (val) => {
      if (!val && val !== 0) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 10;
    };

    if (!validatePercentage(tenthPercentage) || !validatePercentage(twelfthPercentage) || 
        !validatePercentage(diplomaPercentage) || !validatePercentage(graduationPercentage) ||
        !validateCGPA(graduationCGPA)) {
      throw new CustomAPIError.BadRequestError(
        'Invalid eligibility criteria values. Percentages must be 0-100, CGPA must be 0-10.'
      );
    }
  }

  const { course, batch, departments } = await validateJobReceivers({
    receivingCourse,
    receivingBatch,
    receivingDepartments,
  });

  const eligibilityCriteria =
    enableEligibilityFilter === 'true' || enableEligibilityFilter === true
      ? {
          tenthPercentage: tenthPercentage ? Number(tenthPercentage) : null,
          twelfthPercentage: twelfthPercentage ? Number(twelfthPercentage) : null,
          diplomaPercentage: diplomaPercentage ? Number(diplomaPercentage) : null,
          graduationPercentage: graduationPercentage ? Number(graduationPercentage) : null,
          graduationCGPA: graduationCGPA ? Number(graduationCGPA) : null,
        }
      : {};

  const jobOpening = await JobOpeningModel.findOneAndUpdate(
    { _id: jobId, applications: { $size: 0 } },
    {
      profile,
      description,
      location,
      company: {
        id: company._id,
        name: company.name,
        website: company.website,
      },
      jobPackage,
      receivingCourse: { id: course._id, courseName: course.courseName },
      receivingBatch: batch,
      receivingDepartments: departments,
      keySkills,
      postedBy: {
        id: companyAdmin._id,
        name: companyAdmin.name,
      },
      openingsCount,
      deadline,
      cgpaCutoff,
      enableEligibilityFilter: enableEligibilityFilter === 'true' || enableEligibilityFilter === true,
      eligibilityCriteria,
    },
    { runValidators: true }
  );

  if (!jobOpening) {
    throw new CustomAPIError.NotFoundError(`Invalid job id: ${jobId}!`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Updated Job Opening',
    id: jobOpening._id,
  });
};

const deleteJobOpening = async (req, res) => {
  const jobId = req?.params?.jobId;
  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  const job = await JobOpeningModel.findOneAndDelete({
    _id: jobId,
    applications: { $size: 0 },
  });

  if (!job) throw new CustomAPIError.NotFoundError(`Invalid job id: ${jobId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Job Deleted successfully!',
  });
};

const getJobApplications = async (req, res) => {
  const companyId = req.user.companyId;
  
  // Parse query parameters for filters
  const filters = {};
  
  if (req.query.search) {
    filters.search = req.query.search.trim();
  }
  
  if (req.query.status) {
    filters.status = req.query.status;
  }
  
  if (req.query.minCGPA) {
    filters.minCGPA = parseFloat(req.query.minCGPA);
  }
  
  if (req.query.min10thPercentage) {
    filters.min10thPercentage = parseFloat(req.query.min10thPercentage);
  }
  
  if (req.query.min12thPercentage) {
    filters.min12thPercentage = parseFloat(req.query.min12thPercentage);
  }
  
  if (req.query.minGraduationPercentage) {
    filters.minGraduationPercentage = parseFloat(req.query.minGraduationPercentage);
  }
  
  if (req.query.hasResume !== undefined) {
    filters.hasResume = req.query.hasResume === 'true';
  }
  
  if (req.query.branch) {
    filters.branch = req.query.branch;
  }
  
  if (req.query.skills) {
    filters.skills = Array.isArray(req.query.skills) 
      ? req.query.skills 
      : [req.query.skills];
  }
  
  if (req.query.sortBy) {
    filters.sortBy = req.query.sortBy;
  }
  
  // Use filter-aware aggregation if filters are provided, otherwise use standard aggregation
  const hasFilters = Object.keys(filters).length > 0;
  const aggregationPipeline = hasFilters
    ? jobApplicationsAggWithFilters({ companyId, filters })
    : jobApplicationsAgg({ companyId });

  const jobsWithApplications = await JobOpeningModel.aggregate(
    aggregationPipeline
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Found Applications',
    jobsWithApplications,
  });
};

const getSingleJobApplications = async (req, res) => {
  const jobId = req?.params?.jobId;
  const companyId = req?.user?.companyId;

  console.log(jobId, companyId);

  if (!jobId?.trim())
    throw new CustomAPIError.BadRequestError('Job Id is required!');

  const job = (
    await JobOpeningModel.aggregate(
      singleJobApplicationsAgg({ jobId, companyId })
    )
  )?.[0];

  if (!job)
    throw new CustomAPIError.NotFoundError(`No job found with id: ${jobId}`);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Applications found!',
    job,
  });
};

const jobApplicationAction = async (req, res) => {
  const { id: applicationId, action } = req?.params;
  const userId = req?.user?.userId;

  const application = await JobApplicationModel.findById(applicationId);
  if (!application)
    throw new CustomAPIError.BadRequestError('Invalid application id!');

  const { applicantId, jobId, companyId, status: currentStatus } = application;

  const {
    isValid,
    updatedStatus,
    currentJobArr,
    updatedJobArr,
    currentApplicantArr,
    updatedApplicantArr,
  } = isActionValid(action, currentStatus);

  if (!isValid) throw new CustomAPIError.BadRequestError('Invalid action!');

  const job = await JobOpeningModel.findById(jobId);

  if (job.status !== 'open')
    throw new CustomAPIError.BadRequestError('Job is already closed!');

  const company = await CompanyModel.findById(companyId);
  if (!company.admins.includes(userId))
    throw new CustomAPIError.BadRequestError(
      'Not authorized to perform this action'
    );

  application.status = updatedStatus;

  job[currentJobArr] = job[currentJobArr].filter(
    (id) => id.toString() !== applicantId.toString()
  );
  job[updatedJobArr].push(applicantId);

  const applicant = await UserModel.findById(applicantId);
  applicant[currentApplicantArr] = applicant[currentApplicantArr].filter(
    (id) => id.toString() !== jobId.toString()
  );
  applicant[updatedApplicantArr].push(jobId);

  if (updatedStatus === 'hired') {
    company.candidatesHired = (company.candidatesHired || 0) + 1;

    // Create offer record
    const offer = await OfferModel.create({
      jobApplicationId: applicationId,
      jobId,
      studentId: applicantId,
      companyId,
    });

    application.offerId = offer._id;

    // Update user hired status
    applicant.hiredStatus = 'pending_offer';
    applicant.hiredJobId = jobId;
    applicant.hiredApplicationId = applicationId;
  }

  await application.save();
  await job.save();
  await applicant.save();
  await company.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Candidate is ${updatedStatus}`,
  });
};

const createOnCampusPlacement = async (req, res) => {
  const applicationId = req?.params?.id;

  const application = await JobApplicationModel.findById(applicationId);

  if (!application)
    throw new CustomAPIError.NotFoundError(
      `No application found with id: ${applicationId}`
    );

  const { jobId, status: applicationStatus, applicantId } = application;
  if (applicationStatus === 'hired' || applicationStatus === 'rejected')
    throw new CustomAPIError.BadRequestError(
      `Application is already ${applicationStatus}`
    );

  const job = await JobOpeningModel.findById(jobId);
  const {
    profile,
    location,
    company,
    jobPackage,
    status: jobStatus,
    deadline,
  } = job;

  if (jobStatus !== 'open' || new Date() > deadline)
    throw new CustomAPIError.BadRequestError(`Job is closed`);

  let { offerLetter, joiningLetter } = req?.files;
  let joiningDate = req?.body?.joiningDate;

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

  const user = await UserModel.findById(applicantId);

  const placement = await PlacementModel.create({
    jobProfile: profile,
    location,
    company: company.name,
    departmentName: user?.departmentName,
    package: jobPackage,
    isOnCampus: true,
    offerLetter,
    joiningDate,
    joiningLetter,
    studentId: applicantId,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'On-campus placement created!',
    id: placement._id,
  });

  application.status = 'hired';
  await application.save();

  const pastCandidatesArr =
    applicationStatus === 'pending' ? 'applicants' : 'shortlistedCandidates';

  job[pastCandidatesArr] = job[pastCandidatesArr].filter(
    (id) => id.toString() !== applicantId.toString()
  );
  job.selectedCandidates.push(applicantId);
  await job.save();

  const pastJobsArr =
    applicationStatus === 'pending' ? 'jobsApplied' : 'jobsShortlisted';
  user[pastJobsArr] = user[pastJobsArr].filter(
    (id) => id.toString() !== jobId.toString()
  );
  user.jobsSelected.push(jobId);
  user.placements.push(placement._id);
  await user.save();

  const companyDoc = await CompanyModel.findById(company.id);
  if (companyDoc) {
    companyDoc.candidatesHired = (companyDoc.candidatesHired || 0) + 1;
    await companyDoc.save();
  }
};

const getStudentPublicProfile = async (req, res) => {
  const { applicationId, studentId } = req?.params;

  if (!applicationId?.trim() || !studentId?.trim())
    throw new CustomAPIError.BadRequestError(
      'Application Id and Student Id are required'
    );

  const application = await JobApplicationModel.findById(applicationId);

  if (!application)
    throw new CustomAPIError.NotFoundError(
      `No application found with id: ${applicationId}`
    );

  if (application.companyId.toString() !== req?.user?.companyId)
    throw new CustomAPIError.UnauthenticatedError("Can't access this resource");

  if (application.applicantId != studentId)
    throw new CustomAPIError.BadRequestError('Wrong student id!');

  const profileDetails = (
    await UserModel.aggregate(studentProfileDetailsAgg(studentId, false))
  )?.[0];

  if (!profileDetails)
    throw new CustomAPIError.NotFoundError(
      `No student found with id: ${studentId}`
    );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile Details Found!',
    profileDetails,
  });
};

function isActionValid(action, currentStatus) {
  const obj = {
    isValid: false,
    updatedStatus: '',
    currentJobArr: '',
    updatedJobArr: '',
    currentApplicantArr: '',
    updatedApplicantArr: '',
  };

  switch (action) {
    case 'shortlist':
      obj.isValid = currentStatus === 'pending';
      obj.updatedStatus = 'shortlisted';
      obj.updatedJobArr = 'shortlistedCandidates';
      obj.updatedApplicantArr = 'jobsShortlisted';
      break;
    case 'hire':
      obj.isValid =
        currentStatus === 'pending' || currentStatus === 'shortlisted';
      obj.updatedStatus = 'hired';
      obj.updatedJobArr = 'selectedCandidates';
      obj.updatedApplicantArr = 'jobsSelected';
      break;
    case 'reject':
      obj.isValid =
        currentStatus === 'pending' || currentStatus === 'shortlisted';
      obj.updatedStatus = 'rejected';
      obj.updatedJobArr = 'rejectedCandidates';
      obj.updatedApplicantArr = 'jobsRejected';
      break;
  }

  switch (currentStatus) {
    case 'pending':
      obj.currentJobArr = 'applicants';
      obj.currentApplicantArr = 'jobsApplied';
      break;
    case 'shortlist':
      obj.currentJobArr = 'shortlistedCandidates';
      obj.currentApplicantArr = 'jobsShortlisted';
      break;
  }

  return obj;
}

const uploadOfferLetter = async (req, res) => {
  const applicationId = req.params.applicationId;
  const userId = req.user.userId;
  const offerLetterFile = req.files?.offerLetter;

  if (!offerLetterFile) {
    throw new CustomAPIError.BadRequestError('Offer letter file is required');
  }

  const application = await JobApplicationModel.findById(applicationId);
  if (!application) {
    throw new CustomAPIError.BadRequestError('Invalid application id');
  }

  const offer = await OfferModel.findOne({ jobApplicationId: applicationId });
  if (!offer) {
    throw new CustomAPIError.BadRequestError('No offer found for this application');
  }

  if (offer.status !== 'pending') {
    throw new CustomAPIError.BadRequestError('Offer is not in pending status');
  }

  // Check if user is authorized (company admin)
  const company = await CompanyModel.findById(application.companyId);
  if (!company.admins.includes(userId)) {
    throw new CustomAPIError.BadRequestError('Not authorized');
  }

  const fileUploadResp = await fileUpload(offerLetterFile, 'offers', 'document');
  const offerLetterUrl = fileUploadResp?.fileURL;

  offer.offerLetter = offerLetterUrl;
  offer.offerLetterUploadedAt = new Date();
  await offer.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Offer letter uploaded successfully',
  });
};

const getOfferDetails = async (req, res) => {
  const applicationId = req.params.applicationId;
  const userId = req.user.userId;

  const application = await JobApplicationModel.findById(applicationId);
  if (!application) {
    throw new CustomAPIError.BadRequestError('Invalid application id');
  }

  // Check if user is authorized
  const company = await CompanyModel.findById(application.companyId);
  if (!company.admins.includes(userId)) {
    throw new CustomAPIError.BadRequestError('Not authorized');
  }

  const offer = await OfferModel.findOne({ jobApplicationId: applicationId });
  if (!offer) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'No offer found',
      offer: null,
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Offer details found',
    offer: {
      id: offer._id,
      status: offer.status,
      offerLetter: offer.offerLetter,
      offerLetterUploadedAt: offer.offerLetterUploadedAt,
      acceptedAt: offer.acceptedAt,
      rejectedAt: offer.rejectedAt,
    },
  });
};

module.exports = {
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
  getJobsForIncharge,
  getJobApplications,
  jobApplicationAction,
  createOnCampusPlacement,
  getStudentPublicProfile,
  getSingleJob,
  getSingleJobApplications,
  uploadOfferLetter,
  getOfferDetails,
};
