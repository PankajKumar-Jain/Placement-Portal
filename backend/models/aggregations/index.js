const {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
  singleJobCompanyAgg,
  singleJobStudentAgg,
} = require('./studentJob');

const {
  jobApplicationsAgg,
  jobApplicationsAggWithFilters,
  singleJobApplicationsAgg,
  studentJobApplicationsAgg,
} = require('./jobApplications');
const { studentProfileDetailsAgg } = require('./studentDetails');

module.exports = {
  studentJobOpeningsAgg,
  studentJobsByStatusAgg,
  companyInchargeJobsAgg,
  jobApplicationsAgg,
  jobApplicationsAggWithFilters,
  studentProfileDetailsAgg,
  singleJobCompanyAgg,
  singleJobStudentAgg,
  singleJobApplicationsAgg,
  studentJobApplicationsAgg,
};
