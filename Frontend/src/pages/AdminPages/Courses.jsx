import { useSelector, useDispatch } from 'react-redux';
import {
  BatchModal,
  BatchTab,
  DepartmentModal,
  DepartmentsTab,
} from '../../Components';
import { useState } from 'react';
import { redirect } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { setModalData } from '../../features/courseModal/courseModal';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Department Creation and Updation */
    if (intent === 'addDepartment' || intent === 'updateDepartment') {
      const courseId = formData.get('courseId');
      let url = `/courses/${courseId}/departments/`;
      if (intent === 'updateDepartment') url += formData.get('departmentId');
      try {
        if (intent === 'addDepartment') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['courseOptions'] });
        toast.success(
          `Department ${
            intent === 'addDepartment' ? 'added' : 'updated'
          } successfully!`
        );
        document.forms.departmentForm.reset();
        document.getElementById('departmentModal').close();
        return redirect('/admin-dashboard/courses');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to ${
            intent === 'addDepartment' ? 'add' : 'update'
          } department!`;
        document.getElementById('departmentFormError').textContent =
          errorMessage;
        return error;
      }
    }

    /* Department Creation and Updation */
    if (intent === 'addBatch' || intent === 'updateBatch') {
      const courseId = formData.get('courseId');
      let url = `/courses/${courseId}/batches/`;
      if (intent === 'updateBatch') url += formData.get('batchId');
      try {
        if (intent === 'addBatch') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['courseOptions'] });
        toast.success(
          `Batch ${intent === 'addBatch' ? 'added' : 'updated'} successfully!`
        );
        document.forms.batchForm.reset();
        document.getElementById('batchModal').close();
        return redirect('/admin-dashboard/courses');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to ${intent === 'addBatch' ? 'add' : 'update'} batch!`;
        document.getElementById('batchFormError').textContent = errorMessage;
        return error;
      }
    }
  };
};

const CoursePage = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courseOptions);
  const arr = [];
  for (let courseId in courses) {
    arr.push({
      courseId,
      ...courses[courseId],
    });
  }
  const [departmentModalData, setDepartmentModalData] = useState({
    action: 'add',
  });
  const [batchModalData, setBatchModalData] = useState({ action: 'add' });

  return (
    <div className="p-4">
      <DepartmentModal modalData={departmentModalData} />
      <BatchModal modalData={batchModalData} />
      <h3 className="text-2xl text-center underline tracking-wide font-medium">Courses</h3>
      <div className="mt-4">
        {arr.map((course) => {
          const { courseId, courseName, batches, departments } = course;
          return (
            <div key={courseId} className="px-8 py-2 flex flex-col gap-2">
              <div className="flex gap-x-4">
                <h3 className="text-lg tracking-wide">{courseName}</h3>
                <button
                  onClick={() => {
                    document.getElementById('courseFormError').innerText = '';
                    document.getElementById('courseModal').showModal();
                    dispatch(setModalData({ course }));
                  }}
                >
                  <FaEdit />
                </button>
              </div>
              <div role="tablist" className="mt-2 tabs tabs-lifted">
                <DepartmentsTab
                  departments={departments}
                  courseId={courseId}
                  setModalData={setDepartmentModalData}
                />
                <BatchTab
                  batches={batches}
                  courseId={courseId}
                  setModalData={setBatchModalData}
                />
              </div>
              <hr className="mt-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePage;
