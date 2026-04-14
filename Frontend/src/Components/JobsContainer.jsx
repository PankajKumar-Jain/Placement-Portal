import SingleJob from './SingleJobContainer';
import { useSelector } from 'react-redux';

const JobsContainer = () => {
  const { currentJobs, currentFilter } = useSelector((state) => state.jobState);

  const role = useSelector((state) => state.userState.user.role);

  if (!currentJobs.length)
    return (
      <div className="p-4">
        <h3 className="capitalize text-4xl font-bold">no jobs found</h3>
      </div>
    );

  return (
    <div className="p-4 grid gap-8 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
      {currentJobs.map((job) => (
        <SingleJob job={job} status={currentFilter} role={role} key={job._id} />
      ))}
    </div>
  );
};
export default JobsContainer;
