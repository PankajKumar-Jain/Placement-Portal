import { ApplicationsContainer } from '../Components';
import { customFetch, fetchApplicationsQuery } from '../utils';
import { toast } from 'react-toastify';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Create on-campus placement - Hire Candidate */
    if (intent === 'createPlacement') {
      try {
        const applicationId = formData.get('applicationId');
        const url = `/company/applications/${applicationId}/placement`;
        await customFetch.post(url, formData);

        await queryClient.refetchQueries({ queryKey: ['applications'] });
        await queryClient.ensureQueryData(fetchApplicationsQuery());

        /* RESET FORM */
        document.forms.placementForm.reset();
        document.getElementById('placementFormError').innerText = '';
        document.getElementById('placementModal').close();
        toast.success('Candidate hired successfully!');
        return redirect('/company-dashboard/applications');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to create on-campus placement!`;
        document.getElementById('placementFormError').innerText = errorMessage;
        return error;
      }
    }
  };
};

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { jobsWithApplications } = await queryClient.ensureQueryData(
        fetchApplicationsQuery()
      );
      return { jobsWithApplications };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch jobs!';
      console.log(error);
      toast.error(errorMessage);
      return null;
    }
  };
};

const JobApplications = () => {
  return (
    <div>
      <ApplicationsContainer />
    </div>
  );
};
export default JobApplications;
