import { useLoaderData } from 'react-router-dom';
import SingleJobApplication from './SingleJobApplication';
import { PlacementModal } from '..';
import { useState } from 'react';

const ApplicationsContainer = () => {
  const { jobsWithApplications } = useLoaderData();
  const [modalData, setModalData] = useState({
    onCampus: true,
    action: 'create',
  });

  return (
    <div>
      <PlacementModal modalData={modalData} />
      {jobsWithApplications.map((job) => {
        const { _id, profile, openingsCount, deadline, applications } = job;
        return (
          <SingleJobApplication
            key={_id}
            jobId={_id}
            profile={profile}
            openingsCount={openingsCount}
            deadline={deadline}
            applications={applications}
            setModalData={setModalData}
          />
        );
      })}
    </div>
  );
};

export default ApplicationsContainer;
