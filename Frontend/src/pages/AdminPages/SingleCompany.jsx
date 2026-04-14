import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import { fetchSingleCompany } from '../../utils';
import defaultAvatar from '../../assets/default-avatar.jpg';
import { CompanyAdminCard } from '../../Components';

export const loader = (queryClient, store) => {
  return async function ({ params }) {
    const companyId = params.companyId;
    try {
      const { company } = await queryClient.ensureQueryData(
        fetchSingleCompany(companyId)
      );
      return { company };
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch company!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const SingleCompany = () => {
  const { company } = useLoaderData();
  const [activeSection, setActiveSection] = useState('jobs');

  if (!company)
    return <h3 className="p-8 text-2xl capitalize">no company found</h3>;

  const {
    photo,
    name,
    about,
    jobsPosted,
    openingsCreated,
    candidatesHired,
    admins,
    jobs = [],
    hiredCandidates = [],
  } = company;

  return (
    <div className="p-8">
      {/* INTO */}
      <div className="flex flex-col sm:flex-row gap-8 items-center">
        <div className="flex flex-col gap-y-4">
          <img
            src={photo || defaultAvatar}
            alt={`${name} company logo`}
            height="150"
            width="150"
            className="rounded-full"
          />
          <div className="text-center text-xl tracking-wide">{name}</div>
        </div>
        <div className="self-start sm:mt-4 sm:ml-4">
          <span className="text-lg font-medium">About: </span>
          {about}
        </div>
      </div>

      {/* STATS */}
      <div className="mt-4">
        <h3 className="font-medium underline text-xl">Jobs Data:</h3>
        <div className="mt-4 stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Jobs Posted</div>
            <div className="stat-value text-center">{jobsPosted}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Openings Created</div>
            <div className="stat-value text-center">{openingsCreated}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Candidates Hired</div>
            <div className="stat-value text-center">{candidatesHired}</div>
          </div>
        </div>
      </div>

      {/* ACTION SECTIONS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'jobs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSection('jobs')}
          >
            Jobs Posted
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'hired' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSection('hired')}
          >
            Candidates Hired
          </button>
        </div>
      </div>

      {activeSection === 'jobs' && (
        <div className="mt-6">
          <h3 className="font-medium underline text-xl mb-4">Jobs Posted</h3>
          {jobs.length ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Package (LPA)</th>
                    <th>Deadline</th>
                    <th>Applicants</th>
                    <th>Hired</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.profile}</td>
                      <td>{typeof job.jobPackage === 'number' ? job.jobPackage : 'N/A'}</td>
                      <td>{new Date(job.deadline).toLocaleDateString()}</td>
                      <td>{job.applicantsCount || 0}</td>
                      <td>{job.hiredCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No jobs posted by this company yet.</p>
          )}
        </div>
      )}

      {activeSection === 'hired' && (
        <div className="mt-6">
          <h3 className="font-medium underline text-xl mb-4">Hired Candidates</h3>
          {hiredCandidates.length ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Branch</th>
                    <th>Job Role</th>
                    <th>Package (LPA)</th>
                  </tr>
                </thead>
                <tbody>
                  {hiredCandidates.map((student, index) => (
                    <tr key={`${student.studentId || index}-${student.jobRole}`}>
                      <td>{student.name}</td>
                      <td>{student.course || 'N/A'}</td>
                      <td>{student.branch || 'N/A'}</td>
                      <td>{student.jobRole || 'N/A'}</td>
                      <td>{typeof student.package === 'number' ? student.package : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No hired candidates available for this company.</p>
          )}
        </div>
      )}

      {/* ADMINS */}
      <div className="mt-4 p-2">
        <h3 className="font-medium underline text-xl">Admins:</h3>
        {admins?.length ? (
          <div className="mt-4 flex flex-wrap gap-4">
            {admins.map((admin) => (
              <CompanyAdminCard key={admin._id} admin={admin} />
            ))}
          </div>
        ) : (
          <div className="mt-4 text-xl capitalize font-medium">
            no admins found
          </div>
        )}
      </div>
    </div>
  );
};
export default SingleCompany;
