import Navbar from '../Components/Navbar';
import { Outlet, redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { toast } from 'react-toastify';

import { getOptions } from '../Components/SuperAdmin/NavOptions';
import { fetchCourseOptions, customFetch } from '../utils';
import { setCourseOptions } from '../features/courseOptions/courseOptions';
import { AddSingleStudent, CompanyModal, CourseModal } from '../Components';

export const action = (queryClient, store) => {
  return async function ({ request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    /* Single Student */
    if (intent === 'addSingleStudent' || intent === 'updateSingleStudent') {
      let url = '/admin/students/single/';
      if (intent === 'updateSingleStudent') url += formData.get('studentId');
      try {
        if (intent === 'addSingleStudent')
          await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        const courseId = formData.get('courseId');
        const departmentId = formData.get('departmentId');
        const batchId = formData.get('batchId');

        queryClient.removeQueries({ queryKey: ['students'], exact: true });
        queryClient.removeQueries({
          queryKey: ['students', courseId],
        });
        queryClient.removeQueries({
          queryKey: ['students', courseId, departmentId],
        });
        queryClient.removeQueries({
          queryKey: ['students', courseId, batchId],
        });
        toast.success('Student added successfully!');
        document.forms.addSingleStudentForm.reset();
        document.getElementById('addSingleStudentModal').close();
        return redirect('/admin-dashboard/students');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add student!';
        toast.error(errorMessage);
        return null;
      }
    }

    /* Course Creation and Updation */
    if (intent === 'addCourse' || intent === 'updateCourse') {
      console.log('adding course...');
      let url = '/courses/';
      if (intent === 'updateCourse') url += formData.get('courseId');
      try {
        if (intent === 'addCourse') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['courseOptions'] });
        toast.success(
          `Course ${intent === 'addCourse' ? 'added' : 'updated'} successfully!`
        );
        document.forms.courseForm.reset();
        document.getElementById('courseModal').close();
        return redirect('/admin-dashboard/courses');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message || 'Failed to add course!';
        toast.error(errorMessage);
        return null;
      }
    }

    /* Company Creation and Updation */
    if (intent === 'addCompany' || intent === 'updateCompany') {
      const companyId = formData.get('companyId');
      let url = `/admin/companies/`;
      if (intent === 'updateCompany') url += companyId;
      try {
        if (intent === 'addCompany') await customFetch.post(url, formData);
        else await customFetch.patch(url, formData);

        queryClient.removeQueries({ queryKey: ['companies'] });
        if (intent === 'updateCompany')
          queryClient.removeQueries({ queryKey: [companyId] });

        toast.success(
          `company ${
            intent === 'addCompany' ? 'added' : 'updated'
          } successfully!`
        );
        document.forms.companyForm.reset();
        document.getElementById('companyModal').close();
        return redirect('/admin-dashboard/companies');
      } catch (error) {
        console.log(error);
        const errorMessage =
          error?.response?.data?.message ||
          `Failed to ${intent === 'addCompany' ? 'add' : 'update'} company!`;
        toast.error(errorMessage);
        return null;
      }
    }

    /* Announcement Creation */
    if (intent === 'createAnnouncement') {
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
    }
  };
};

export const loader = (queryClient, store) => {
  return async function () {
    try {
      const { options } = await queryClient.ensureQueryData(
        fetchCourseOptions()
      );
      store.dispatch(setCourseOptions({ options }));
      return true;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to fetch courses!';
      console.log(error);
      toast.error(errorMessage);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return redirect('/');
      }
      return error;
    }
  };
};

const AdminDashboard = () => {
  const dispatch = useDispatch();

  return (
    <>
      <Navbar options={getOptions(dispatch)} />
      <CourseModal />
      <CompanyModal />
      <AddSingleStudent />
      <Outlet />
    </>
  );
};
export default AdminDashboard;
