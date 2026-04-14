import { Link } from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { FiExternalLink } from 'react-icons/fi';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import OfferUploadModal from '../OfferUploadModal';
import ApplicationFilterPanel from './ApplicationFilterPanel';

const SingleJobApplication = ({
  jobId,
  profile,
  openingsCount,
  deadline,
  applications,
}) => {
  let pending = [],
    shortlisted = [],
    hired = [],
    rejected = [];

  for (let item of applications) {
    const status = item._id.status;
    switch (status) {
      case 'pending':
        pending = item.applications;
        break;
      case 'shortlisted':
        shortlisted = item.applications;
        break;
      case 'hired':
        hired = item.applications;
        break;
      case 'rejected':
        rejected = item.applications;
        break;
    }
  }

  const [filters, setFilters] = useState({});
  const queryClient = useQueryClient();

  const handleAction = async (applicationId, action) => {
    const url = `/company/applications/${applicationId}/action/${action}`;
    try {
      const { data } = await customFetch.patch(url);
      const message = data?.message || 'successfully performed action!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || 'Failed to perform action!';
      toast.error(errorMessage);
    }
  };

  // Client-side filtering function
  const applyClientFilters = (applications, currentFilters) => {
    if (!applications || !currentFilters) return applications;

    return applications.filter((app) => {
      // Search filter (name)
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const matchName = app.applicantName?.toLowerCase().includes(searchLower);
        if (!matchName) return false;
      }

      // Resume filter
      if (currentFilters.hasResume !== 'all' && currentFilters.hasResume !== undefined && currentFilters.hasResume !== '') {
        const hasResume = !!app.resume;
        const filterHasResume = currentFilters.hasResume === 'true';
        if (hasResume !== filterHasResume) return false;
      }

      return true;
    });
  };

  const allBranches = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Electrical'];

  return (
    <div className="py-4 px-8 flex flex-col gap-y-4">
      <Link
        to={`/company-dashboard/jobs/${jobId}`}
        className="text-xl font-medium tracking-wide flex gap-x-2 items-center underline hover:link-primary"
      >
        {profile} <FiExternalLink />
      </Link>
      <p className="flex gap-x-4">
        <span>Deadline: {new Date(deadline).toLocaleDateString()}</span>
        <span>Openings Count: {openingsCount}</span>
      </p>

      {/* Filter Panel */}
      <ApplicationFilterPanel
        onFiltersChange={setFilters}
        branches={allBranches}
      />

      <div role="tablist" className="tabs tabs-lifted">
        <TabContent
          jobId={jobId}
          jobType="pending"
          arr={applyClientFilters(pending, filters)}
          originalLength={pending.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="shortlisted"
          arr={applyClientFilters(shortlisted, filters)}
          originalLength={shortlisted.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="hired"
          arr={applyClientFilters(hired, filters)}
          originalLength={hired.length}
          onAction={handleAction}
        />
        <TabContent
          jobId={jobId}
          jobType="rejected"
          arr={applyClientFilters(rejected, filters)}
          originalLength={rejected.length}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

const TabContent = ({
  jobType,
  jobId,
  arr,
  originalLength,
  onAction,
}) => {
  const [selectedApplicationForOffer, setSelectedApplicationForOffer] =
    useState(null);

  return (
    <>
      <input
        type="radio"
        name={`${jobId}_tab`}
        role="tab"
        className="tab capitalize text-blue-500"
        aria-label={jobType}
        defaultChecked={jobType === 'pending'}
      />
      <div role="tabpanel" className="tab-content">
        {arr.length ? (
          <div className="overflow-x-auto">
            <div className="mb-2 text-sm text-gray-600">
              Showing {arr.length} of {originalLength} {jobType} applications
            </div>
            <table className="table">
              {/* head */}
              <thead className="text-base font-normal">
                <tr>
                  <th>Name</th>
                  <th>Cover Letter</th>
                  <th>Resume</th>
                  <th>Portfolio</th>
                  {(jobType === 'pending' || jobType === 'shortlisted') && (
                    <th>Action</th>
                  )}
                  {jobType === 'hired' && <th>Offer Action</th>}
                </tr>
              </thead>
              <tbody>
                {arr.map((application) => {
                  const {
                    _id,
                    applicantName,
                    applicantId,
                    coverLetter,
                    resume,
                    portfolio,
                  } = application;
                  return (
                    <tr key={_id}>
                      <td>
                        <a
                          href={`/company-dashboard/applications/${_id}/students/${applicantId}`}
                          className="link"
                        >
                          {applicantName}
                        </a>
                      </td>
                      <td>{coverLetter}</td>
                      <td className="link">
                        <a href={resume} target="_blank" rel="noreferrer">
                          Resume
                        </a>
                      </td>
                      <td className="link">
                        <a href={portfolio} target="_blank" rel="noreferrer">
                          Portfolio
                        </a>
                      </td>
                      {jobType === 'pending' ? (
                        <td className="flex flex-wrap gap-2">
                          <ActionButton
                            action="shortlist"
                            applicationId={_id}
                            onAction={onAction}
                          />
                          <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                          <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                        </td>
                      ) : jobType == 'shortlisted' ? (
                        <td className="flex flex-wrap gap-2">
                          <ActionButton action="hire" applicationId={_id} onAction={onAction} />
                          <ActionButton action="reject" applicationId={_id} onAction={onAction} />
                        </td>
                      ) : jobType === 'hired' ? (
                        <td className="flex flex-wrap items-center gap-2">
                          <span className="badge badge-info badge-outline">
                            {application.offer?.status === 'accepted'
                              ? 'Offer accepted'
                              : application.offer?.status === 'rejected'
                              ? 'Offer rejected'
                              : 'Offer pending'}
                          </span>
                          {application.offer?.status === 'accepted' && (
                            <button
                              className="btn btn-sm btn-info text-white"
                              onClick={() => setSelectedApplicationForOffer(_id)}
                            >
                              Upload Offer
                            </button>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-center py-8 text-gray-500">
            {originalLength === 0
              ? `No ${jobType} applications`
              : `No applications match the selected filters`}
          </p>
        )}
      </div>

      {selectedApplicationForOffer && (
        <OfferUploadModal
          applicationId={selectedApplicationForOffer}
          onClose={() => setSelectedApplicationForOffer(null)}
        />
      )}
    </>
  );
};

const ActionButton = ({ action, applicationId, onAction }) => {
  let btnClass = 'btn btn-sm capitalize ';
  switch (action) {
    case 'hire':
      btnClass += 'btn-success text-white';
      break;
    case 'reject':
      btnClass += 'btn-error text-white';
      break;
    case 'shortlist':
      btnClass += 'btn-warning';
      break;
  }

  return (
    <button
      className={btnClass}
      onClick={() => onAction(applicationId, action)}
    >
      {action}
    </button>
  );
};

export default SingleJobApplication;
