import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { FaPowerOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { logoutUser } from '../features/user/userSlice';
import { resetStudentProfile } from '../features/studentProfile/studentProfileSlice';
import { customFetch } from '../utils/axiosSetup';

const Navbar = ({ options }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { name: userName, role: userRole } = useSelector(
    (state) => state?.userState?.user
  );
  const queryClient = useQueryClient();

  async function logout() {
    try {
      await customFetch.get('/auth/logout');
      toast.error('Logged out successfully!');
      dispatch(logoutUser());
      dispatch(resetStudentProfile());
      queryClient.clear();
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  }

  function returnOptions() {
    return options.map((option) => {
      const { id, href, text, isParentMenu, subMenus } = option;

      if (!isParentMenu)
        return (
          <li className="capitalize text-black" key={id}>
            <NavLink to={href} end>
              {text}
            </NavLink>
          </li>
        );
      else
        return (
          <li key={id}>
            <details>
              <summary className="capitalize text-black">{text}</summary>
              <ul className="p-2 z-10">
                {subMenus.map((menu) => (
                  <li key={menu.id}>{menu.element}</li>
                ))}
              </ul>
            </details>
          </li>
        );
    });
  }

  return (
    <div className="navbar bg-green-200">
      <div className="navbar-start ml-4">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {returnOptions()}
          </ul>
        </div>
        <p className="normal-case text-black text-xl">Hello, {userName}</p>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{returnOptions()}</ul>
      </div>
      <div className="navbar-end">
        {userRole === 'company_admin' && (
          <button
            className="btn btn-sm  btn-primary"
            onClick={() => {
              // window.location.href = '/company-dashboard/create-job?action=create';
              navigate('create-job');
            }}
          >
            Create Job
          </button>
        )}
        <button className="p-4 hover:text-red-500 text-black" onClick={logout}>
          <FaPowerOff />
        </button>
      </div>
    </div>
  );
};
export default Navbar;
