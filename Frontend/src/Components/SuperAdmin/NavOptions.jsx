import { NavLink } from 'react-router-dom';
import { resetModalData } from '../../features/createStudentModal/studentModalData';
import { resetModalData as resetCourseModal } from '../../features/courseModal/courseModal';
import { resetModalData as resetCompanyModal } from '../../features/companyModal/companyModal';

export function getOptions(dispatch) {
  return [
    { id: 1, text: 'dashboard', href: '' },
    {
      id: 2,
      text: 'students',
      isParentMenu: true,
      subMenus: [
        {
          id: '2_1',
          element: <NavLink to="students">View Students</NavLink>,
        },
        {
          id: '2_2',
          element: (
            <button
              onClick={() => {
                document.getElementById('addSingleStudentFormError').innerText =
                  '';
                document.getElementById('addSingleStudentModal').showModal();
                dispatch(resetModalData());
              }}
            >
              Add One Student
            </button>
          ),
        },
        // {
        //   id: '2_3',
        //   element: <button>Add Students by file</button>,
        // },
      ],
    },
    {
      id: 3,
      text: 'courses',
      isParentMenu: true,
      subMenus: [
        {
          id: '3_1',
          element: <NavLink to="courses">View Courses</NavLink>,
        },
        {
          id: '3_2',
          element: (
            <button
              onClick={() => {
                document.getElementById('courseFormError').innerText = '';
                dispatch(resetCourseModal());
                document.getElementById('courseModal').showModal();
              }}
            >
              Add Course
            </button>
          ),
        },
      ],
    },
    {
      id: 4,
      text: 'announcements',
      href: 'announcements',
    },
    {
      id: 5,
      text: 'companies',
      isParentMenu: true,
      subMenus: [
        {
          id: '5_1',
          element: <NavLink to="companies">View Companies</NavLink>,
        },
        {
          id: '5_2',
          element: (
            <button
              onClick={() => {
                document.getElementById('companyFormError').innerText = '';
                dispatch(resetCompanyModal());
                document.getElementById('companyModal').showModal();
              }}
            >
              Add Company
            </button>
          ),
        },
      ],
    },
    {
      id: 6,
      text: 'settings',
      href: 'settings',
    },
  ];
}
