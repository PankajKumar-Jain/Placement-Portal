import { Link, useLoaderData } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { getCompanyWebsite } from '../../utils';

const ApplicationsContainer = () => {
  let pending = [],
    shortlisted = [],
    hired = [],
    rejected = [];

  const applications = useLoaderData()?.applications || [];

  for (let item of applications) {
    const status = item._id.status;
    switch (status) {
      case 'pending':
        pending = item.application;
        break;
      case 'shortlisted':
        shortlisted = item.application;
        break;
      case 'hired':
        hired = item.application;
        break;
      case 'rejected':
        rejected = item.application;
        break;
    }
  }

  return (
    <div className="py-4 px-8 flex flex-col gap-y-4">
      <div role="tablist" className="tabs tabs-lifted">
        <TabContent jobType="pending" arr={pending} />
        <TabContent jobType="shortlisted" arr={shortlisted} />
        <TabContent jobType="hired" arr={hired} />
        <TabContent jobType="rejected" arr={rejected} />
      </div>
    </div>
  );
};

const TabContent = ({ jobType, arr }) => {
  return (
    <>
      <input
        type="radio"
        name="applications"
        role="tab"
        className="tab capitalize text-blue-500"
        aria-label={jobType}
        defaultChecked={jobType === 'pending'}
      />
      <div role="tabpanel" className="tab-content">
        {arr.length ? (
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead className="text-base font-normal">
                <tr>
                  <th>Job Profile</th>
                  <th>Company</th>
                  <th>Cover Letter</th>
                  <th>Resume</th>
                  <th>Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {arr.map((application) => {
                  const { _id, coverLetter, resume, portfolio, job } =
                    application;
                  const { _id: jobId, profile, company } = job;
                  return (
                    <tr key={_id}>
                      <td>
                        <a href={`jobs/${jobId}`} className="link">
                          {profile}
                        </a>
                      </td>
                      <td>
                        <a
                          href={getCompanyWebsite(company?.website)}
                          className="link flex gap-2 items-center"
                          target="_blank"
                        >
                          {company?.name} <FiExternalLink />
                        </a>
                      </td>
                      <td>{coverLetter}</td>
                      <td className="link">
                        <a href={resume} target="_blank">
                          Resume
                        </a>
                      </td>
                      <td className="link">
                        <a href={portfolio} target="_blank">
                          Portfolio
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 font-medium text-lg">No applications</p>
        )}
      </div>
    </>
  );
};

export default ApplicationsContainer;
