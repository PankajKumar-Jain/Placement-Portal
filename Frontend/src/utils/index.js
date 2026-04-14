export { customFetch } from './axiosSetup';

export {
  getStudentJobFilters,
  getCompanyJobFilters,
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
} from './prepareOptions';

export {
  fetchJobsQuery,
  fetchCoursesQuery,
  fetchDeptQuery,
  fetchBatchQuery,
  fetchApplicationsQuery,
  fetchStudentPrivateProfile,
  fetchStudentPublicProfile,
  fetchStudentPersonal,
  fetchStudentEducation,
  fetchStudentExperiences,
  fetchStudentPlacements,
  fetchStudentTrainings,
  fetchStudentSkills,
  fetchStudentAchievements,
  fetchCourseOptions,
  fetchSingleJobQuery,
  fetchSingleJobApplicationsQuery,
  fetchStudents,
  fetchCompanies,
  fetchSingleCompany,
  fetchStudentApplications,
  fetchAnnouncements,
  fetchStudentAnnouncements,
} from './fetchQueries';

export { formatDate, getCompanyWebsite } from './jsUtils';

