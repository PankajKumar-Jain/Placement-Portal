import { Outlet, redirect } from 'react-router-dom';

import Navbar from '../Components/Navbar';
import { options } from '../Components/Student/NavOptions';
import { customFetch } from '../utils';

export const loader = () => {
  return async function ({ request }) {
    try {
      const { data } = await customFetch.get('/user/whoami');
      const { user } = data;
      const isResetRoute = request.url.includes('/student-dashboard/reset-password');

      if (user?.role === 'student' && user?.forcePasswordReset && !isResetRoute) {
        return redirect('/student-dashboard/reset-password');
      }

      if (
        user?.role === 'student' &&
        !user?.forcePasswordReset &&
        isResetRoute
      ) {
        return redirect('/student-dashboard');
      }

      return null;
    } catch (error) {
      return redirect('/');
    }
  };
};

const StudentDashboard = () => {
  return (
    <>
      <Navbar options={options} />
      <Outlet />
    </>
  );
};
export default StudentDashboard;
