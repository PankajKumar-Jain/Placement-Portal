import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchStudentAnnouncements } from '../utils';

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const data = await queryClient.ensureQueryData(fetchStudentAnnouncements());
      return data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch announcements!';
      console.log(error);
      toast.error(errorMessage);
      return error;
    }
  };
};

const StudentAnnouncements = () => {
  const { notices, lastNoticeFetched } = useLoaderData();
  const hasNotices = Array.isArray(notices) && notices.length > 0;

  return (
    <div className="p-4">
      <h3 className="mb-4 text-2xl font-semibold tracking-wide underline">
        Announcements
      </h3>

      {hasNotices ? (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isNew = new Date(notice.createdAt) > new Date(lastNoticeFetched);
            return (
              <article
                key={notice._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{notice.noticeTitle}</h4>
                    {notice.isUrgent && (
                      <span className="badge badge-error mt-2 inline-block">Urgent</span>
                    )}
                    {isNew && (
                      <span className="badge badge-primary mt-2 ml-2 inline-block">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(notice.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="mt-3 text-gray-700">{notice.noticeBody}</p>

                {notice.noticeFile && (
                  <a
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                    href={notice.noticeFile}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View attachment
                  </a>
                )}

                <div className="mt-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Branches:</span>{' '}
                    {notice.receivingDepartments
                      ?.map((dept) => dept.departmentName)
                      .join(', ') || 'All'}
                  </div>
                  <div>
                    <span className="font-semibold">Batches:</span>{' '}
                    {notice.receivingBatches?.map((batch) => batch.batchYear).join(', ') ||
                      'All'}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No announcements are available.</p>
      )}
    </div>
  );
};

export default StudentAnnouncements;
