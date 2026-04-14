import { toast } from 'react-toastify';

import {
  StudentIntro,
  StudentEducation,
  StudentExperience,
  StudentTraining,
  SkillsTab,
  AchievementsTab,
} from '../Components';

import { initialProfileSetup } from '../features/studentProfile/studentProfileSlice';
import { fetchStudentPublicProfile } from '../utils';

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const { applicationId, studentId } = params;
    try {
      const { profileDetails } = await queryClient.ensureQueryData(
        fetchStudentPublicProfile({ applicationId, studentId })
      );
      store.dispatch(initialProfileSetup({ profileDetails, type: 'public' }));
      return {
        profileDetails,
      };
    } catch (error) {
      console.log(error.response);
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch student details!';
      toast.error(errorMessage);
      return error;
    }
  };
};

const PublicStudentProfile = () => {
  return (
    <div className="p-8 lg:p-12 flex flex-col gap-y-8">
      <StudentIntro />

      <hr />

      <div role="tablist" className="tabs tabs-lifted">
        <StudentEducation />
      </div>

      <hr />

      <div role="tablist" className="tabs tabs-lifted">
        <StudentExperience />
        <StudentTraining />
      </div>

      <hr />

      <div role="tablist" className="tabs tabs-lifted">
        <SkillsTab />
        <AchievementsTab />
      </div>
    </div>
  );
};
export default PublicStudentProfile;
