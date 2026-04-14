import Navbar from '../Components/Navbar';
import { Outlet, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import { options } from '../Components/CompanyAdmin/NavOptions';
import { fetchCourseOptions } from '../utils';
import { setCourseOptions } from '../features/courseOptions/courseOptions';

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

const CompanyDashboard = () => {
  return (
    <>
      <Navbar options={options} />
      <Outlet />
    </>
  );
};
export default CompanyDashboard;
