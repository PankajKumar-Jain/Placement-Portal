import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const DepartmentsTab = ({ departments, courseId, setModalData }) => {
  return (
    <>
      <input
        type="radio"
        name={`course-tab-${courseId}`}
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="departments"
        defaultChecked={true}
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <div className="flex justify-between">
          <h3 className="text-xl font-medium">Departments</h3>
          <button
            className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
            onClick={() => {
              setModalData({ action: 'add', courseId });
              document.getElementById('departmentModal').showModal();
              document.getElementById('departmentFormError').innerText = '';
            }}
          >
            <FaPlusSquare />
            New
          </button>
        </div>

        {departments?.length ? (
          <div className="mt-4 border-x-2 border-t-2 border-black">
            {departments.map((department) => (
              <DepartmentContainer
                key={department.departmentId}
                department={department}
                setModalData={setModalData}
                courseId={courseId}
              />
            ))}
          </div>
        ) : (
          <div>No departments found</div>
        )}
      </div>
    </>
  );
};

const DepartmentContainer = ({ department, courseId, setModalData }) => {
  const queryClient = useQueryClient();

  return (
    <div className="flex justify-between py-2 px-4 border-b-2 border-black w-full">
      <h4>
        {department.departmentCode} - {department.departmentName}
      </h4>
      <div className="flex gap-x-2">
        <button
          onClick={() => {
            setModalData({ action: 'update', department, courseId });
            document.getElementById('departmentModal').showModal();
            document.getElementById('departmentFormError').innerText = '';
          }}
        >
          <FaEdit />
        </button>
        {/* <button
          onClick={() => handleDeleteDepartment({ queryClient, department })}
        >
          <FaTrash />
        </button> */}
      </div>
    </div>
  );
};

async function handleDeleteDepartment({ queryClient, dispatch, skill }) {
  try {
    await customFetch.delete(`/admin/courses/`);
    toast.success('Department deleted successfully!');
    return redirect('/admin-dashboard/courses');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete department!';
    toast.error(errorMessage);
    return error;
  }
}

export default DepartmentsTab;
