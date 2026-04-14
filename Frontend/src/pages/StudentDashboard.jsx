import { Outlet } from 'react-router-dom';

import Navbar from '../Components/Navbar';
import { options } from '../Components/Student/NavOptions';

const StudentDashboard = () => {
  return (
    <>
      <Navbar options={options} />
      <Outlet />
    </>
  );
};
export default StudentDashboard;
