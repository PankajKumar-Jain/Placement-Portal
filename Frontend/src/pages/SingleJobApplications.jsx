import { customFetch, fetchSingleJobApplicationsQuery } from '../utils';
import { SingleJobApplication } from '../Components';
import { useLoaderData } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
        await queryClient.refetchQueries({ queryKey: ['single-job-applications'] });

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
  return async function ({ params }) {
    const jobId = params.jobId;
    try {
      const { job } = await queryClient.ensureQueryData(
        fetchSingleJobApplicationsQuery(jobId)
      );
      return { job, jobId };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch job!';
      console.log(error);
      toast.error(errorMessage);
      return null;
    }
  };
};

const SingleJobApplications = () => {
  const { job, jobId } = useLoaderData();

  const query = fetchSingleJobApplicationsQuery(jobId);
  const { data: queryData, isLoading } = useQuery({
    ...query,
    initialData: { job },
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const currentJob = queryData?.job || job;

  return (
    <div>
      <SingleJobApplication
        jobId={jobId}
        profile={currentJob?.profile}
        openingsCount={currentJob?.openingsCount}
        deadline={currentJob?.deadline}
        applications={currentJob?.applications}
        isLoading={isLoading}
      />
    </div>
  );
};
export default SingleJobApplications;
