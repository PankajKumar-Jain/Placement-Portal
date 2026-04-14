import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  customFetch,
  fetchAnnouncements,
  getBatchOptions,
  getCourseOptions,
  getDepartmentOptions,
} from '../../utils';

const Announcements = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const [selectedCourse, setSelectedCourse] = useState('-1');
  const [targetType, setTargetType] = useState('all');
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(fetchAnnouncements());
  const announcements = data?.notices ?? [];

  const handleDeleteAnnouncement = async (id) => {
    const confirmed = window.confirm('Delete this announcement for all students?');
    if (!confirmed) return;

    try {
      await customFetch.delete(`/notice/${id}`);
      queryClient.removeQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully!');
    } catch (error) {
      console.log(error);
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete announcement!';
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!selectedCourse || selectedCourse === '-1') {
      setDeptOptions([]);
      setBatchOptions([]);
      return;
    }

    const course = courseOptions[selectedCourse];
    setDeptOptions(getDepartmentOptions(course?.departments || []));
    setBatchOptions(getBatchOptions(course?.batches || []));
  }, [selectedCourse, courseOptions]);

  const selectAll = (name) => {
    const checkboxes = document.querySelectorAll(`input[name='${name}']`);
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  };

  const handleTargetTypeChange = (e) => {
    const newTargetType = e.target.value;
    setTargetType(newTargetType);
    if (newTargetType === 'all') {
      setSelectedCourse('-1');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h3 className="mb-4 text-2xl font-semibold tracking-wide underline">
          Announcements / Broadcast
        </h3>
        <Form
          method="post"
          encType="multipart/form-data"
          name="announcementForm"
          className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="intent" value="createAnnouncement" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                name="noticeTitle"
                className="input input-bordered"
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Target Type</span>
              </label>
              <select
                name="targetType"
                className="select select-bordered"
                value={targetType}
                onChange={handleTargetTypeChange}
                required
              >
                <option value="all">All Students</option>
                <option value="course">Course-wise</option>
                <option value="branch">Branch-wise</option>
                <option value="batch">Batch-wise</option>
                <option value="branch_batch">Branch + Batch</option>
              </select>
            </div>
          </div>

          {targetType !== 'all' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Target Course</span>
              </label>
              <select
                name="receivingCourse"
                id="announcementCourse"
                className="select select-bordered"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="-1">Select Course</option>
                {getCourseOptions(courseOptions).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Message</span>
            </label>
            <textarea
              name="noticeBody"
              className="textarea textarea-bordered h-36"
              placeholder="Write the announcement message here"
              required
            />
          </div>

          {(targetType === 'branch' || targetType === 'branch_batch') && (
            <div className="form-control">
              <label className="label justify-between gap-2">
                <span className="label-text font-medium">Branches</span>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => selectAll('receivingDepartments')}
                >
                  Select all
                </button>
              </label>
              <div className="flex flex-wrap gap-3 rounded border border-gray-200 p-3">
                {deptOptions.length ? (
                  deptOptions.map((option) => (
                    <label key={option.value} className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="receivingDepartments"
                        value={option.value}
                        className="checkbox"
                      />
                      <span className="label-text">{option.text}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Choose a course to load branches.</p>
                )}
              </div>
            </div>
          )}

          {(targetType === 'batch' || targetType === 'branch_batch') && (
            <div className="form-control">
              <label className="label justify-between gap-2">
                <span className="label-text font-medium">Batches</span>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => selectAll('receivingBatches')}
                >
                  Select all
                </button>
              </label>
              <div className="flex flex-wrap gap-3 rounded border border-gray-200 p-3">
                {batchOptions.length ? (
                  batchOptions.map((option) => (
                    <label key={option.value} className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="receivingBatches"
                        value={option.value}
                        className="checkbox"
                      />
                      <span className="label-text">{option.text}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Choose a course to load batches.</p>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label cursor-pointer gap-3">
                <input type="checkbox" name="isUrgent" className="checkbox" value="true" />
                <span className="label-text font-medium">Mark as urgent</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Attachment (optional)</span>
              </label>
              <input type="file" name="noticeFile" className="file-input file-input-bordered" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary">
              Publish announcement
            </button>
            <span id="announcementFormError" className="text-sm text-error" />
          </div>
        </Form>
      </div>

      <div>
        <h4 className="mb-4 text-xl font-semibold">Recent Broadcasts</h4>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading announcements...</p>
        ) : announcements.length ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                key={announcement._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h5 className="text-lg font-semibold">{announcement.noticeTitle}</h5>
                    {announcement.isUrgent && (
                      <span className="badge badge-error mt-2 inline-block">Urgent</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">{announcement.noticeBody}</p>
                {announcement.noticeFile && (
                  <a
                    href={announcement.noticeFile}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    View attachment
                  </a>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-3 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Course:</span>{' '}
                    {announcement.receivingCourse?.courseName || 'All'}
                  </div>
                  <div>
                    <span className="font-semibold">Branches:</span>{' '}
                    {announcement.receivingDepartments
                      ?.map((dept) => dept.departmentName)
                      .join(', ') || 'All'}
                  </div>
                  <div>
                    <span className="font-semibold">Batches:</span>{' '}
                    {announcement.receivingBatches
                      ?.map((batch) => batch.batchYear)
                      .join(', ') || 'All'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No announcements have been published yet.</p>
        )}
      </div>
    </div>
  );
};

export const action = (queryClient, store) => {
  return async ({ request }) => {
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent !== 'createAnnouncement') {
      return null;
    }

    try {
      const targetType = formData.get('targetType') || 'all';
      const receivingCourse = formData.get('receivingCourse');
      const receivingDepartments = formData.getAll('receivingDepartments');
      const receivingBatches = formData.getAll('receivingBatches');

      const noticeTitle = formData.get('noticeTitle');
      const noticeBody = formData.get('noticeBody');
      const isUrgent = formData.get('isUrgent');

      if (!noticeTitle?.trim() || !noticeBody?.trim()) {
        throw new Error('Notice title and body are required!');
      }

      if (targetType !== 'all') {
        if (!receivingCourse || receivingCourse === '-1' || receivingCourse === 'Select Course') {
          throw new Error('Please select a target course!');
        }
      }

      if (targetType === 'branch' && !receivingDepartments.length) {
        throw new Error('Please select at least one branch!');
      }

      if (targetType === 'batch' && !receivingBatches.length) {
        throw new Error('Please select at least one batch!');
      }

      if (targetType === 'branch_batch' && (!receivingDepartments.length || !receivingBatches.length)) {
        throw new Error('Please select at least one branch and one batch!');
      }

      const payload = new FormData();
      payload.append('noticeTitle', noticeTitle);
      payload.append('noticeBody', noticeBody);
      payload.append('targetType', targetType);

      if (targetType !== 'all') {
        payload.append('receivingCourse', receivingCourse);
      }

      if (receivingDepartments.length && targetType !== 'batch') {
        payload.append('receivingDepartments', JSON.stringify(receivingDepartments));
      }

      if (receivingBatches.length && targetType !== 'course') {
        payload.append('receivingBatches', JSON.stringify(receivingBatches));
      }

      if (isUrgent) payload.append('isUrgent', true);

      const noticeFile = formData.get('noticeFile');
      if (noticeFile?.name) payload.append('noticeFile', noticeFile);

      await customFetch.post('/notice', payload);

      queryClient.removeQueries({ queryKey: ['announcements'] });

      toast.success('Announcement created successfully!');
      document.forms.announcementForm?.reset();
      return redirect('/admin-dashboard/announcements');
    } catch (error) {
      console.log(error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create announcement!';
      toast.error(errorMessage);
      return null;
    }
  };
};

export default Announcements;
