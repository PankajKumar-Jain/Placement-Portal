import { customFetch } from '../../utils';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserGraduate, FaBuilding, FaBriefcase, FaUserCheck, FaRupeeSign, FaTrophy } from 'react-icons/fa';

export const loader = (queryClient) => async () => {
  try {
    const { data } = await customFetch.get('/admin/stats');
    return { stats: data.stats };
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'Failed to fetch stats!';
    toast.error(errorMessage);
    return null;
  }
};

const StatCard = ({ title, value, icon, colorClass, subtitle = null }) => {
  return (
    <div className={`stat shadow max-w-sm rounded-2xl bg-base-100 border-t-4 ${colorClass}`}>
      <div className="stat-figure text-3xl opacity-80 pt-2">
        {icon}
      </div>
      <div className="stat-title text-base font-semibold">{title}</div>
      <div className="stat-value text-4xl">{value}</div>
      {subtitle && <div className="stat-desc mt-1 font-medium">{subtitle}</div>}
    </div>
  );
};

const AdminAnalytics = () => {
  const { stats } = useLoaderData() || { stats: {} };

  // Calculate total across all departments to derive percentages
  const totalDepPlacements = stats.departmentPlacements?.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Colors array to assign distinct colors per department
  const barColors = ['progress-primary', 'progress-secondary', 'progress-accent', 'progress-success', 'progress-warning', 'progress-info'];

  return (
    <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto flex flex-col gap-y-10">
      <h2 className="text-3xl font-bold text-center text-primary">Placement Analytics Dashboard</h2>
      
      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 place-content-center">
        <StatCard title="Students" value={stats.totalStudents || 0} icon={<FaUserGraduate />} colorClass="border-blue-500 text-blue-500" />
        <StatCard title="Companies" value={stats.totalCompanies || 0} icon={<FaBuilding />} colorClass="border-indigo-500 text-indigo-500" />
        <StatCard title="Jobs" value={stats.totalJobsPosted || 0} icon={<FaBriefcase />} colorClass="border-green-500 text-green-500" />
        <StatCard title="Placements" value={stats.totalCandidatesHired || 0} icon={<FaUserCheck />} colorClass="border-yellow-500 text-yellow-500" />
        <StatCard title="Avg Package" value={stats.avgPackage ? `${stats.avgPackage} LPA` : 'N/A'} icon={<FaRupeeSign />} colorClass="border-cyan-500 text-cyan-600" />
        <StatCard title="Highest Pkg" value={stats.highestPackage ? `${stats.highestPackage} LPA` : 'N/A'} icon={<FaTrophy />} colorClass="border-red-500 text-red-500" />
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Department-wise Placement Breakdown */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-4">Department Placements</h3>
            {stats.departmentPlacements?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {stats.departmentPlacements.map((dept, index) => {
                  const percentage = Math.round((dept.value / totalDepPlacements) * 100);
                  const progressColor = barColors[index % barColors.length];
                  
                  return (
                    <div key={dept.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{dept.name}</span>
                        <span className="font-bold">{dept.value} Students ({percentage}%)</span>
                      </div>
                      <progress className={`progress ${progressColor} w-full`} value={dept.value} max={totalDepPlacements}></progress>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No departmental placement data available yet.</p>
            )}
          </div>
        </div>

        {/* Global Quick Insights */}
        <div className="card bg-base-100 shadow-xl bg-gradient-to-br from-primary to-secondary text-primary-content">
          <div className="card-body">
            <h3 className="card-title text-xl mb-6 border-b border-primary-content/20 pb-2">Quick Insights</h3>
            <ul className="flex flex-col gap-y-4 text-lg font-medium list-disc pl-4">
              <li>You have <strong>{stats.totalCompanies}</strong> registered partner companies.</li>
              <li>A total of <strong>{stats.totalJobsPosted}</strong> job openings have been listed so far.</li>
              <li>There are currently <strong>{stats.totalCandidatesHired}</strong> successful hires across all branches.</li>
              <li>The average recruitment package stands at an impressive <strong>{stats.avgPackage || 0} LPA</strong>.</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminAnalytics;
