import { Link, useLoaderData } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { setModalData } from '../../features/createStudentModal/studentModalData';
import { customFetch } from '../../utils';

const StudentsTable = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { students, page, limit, totalPages, course, departments, batches } =
    useLoaderData();

  const handleDeleteStudent = async (studentId) => {
    const confirmed = globalThis.confirm(
      'Are you sure you want to delete this student?'
    );
    if (!confirmed) return;

    try {
      await customFetch.delete(`/admin/students/single/${studentId}`);
      toast.success('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete student';
      toast.error(errorMessage);
    }
  };

  const handleToggleBlock = async (studentId, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    const confirmed = globalThis.confirm(
      `Are you sure you want to ${action} this student?`
    );
    if (!confirmed) return;

    try {
      await customFetch.patch(`/admin/students/single/${studentId}/${action}`);
      toast.success(
        `Student ${isBlocked ? 'unblocked' : 'blocked'} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ['students'], exact: false });
      globalThis.location.reload();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || `Failed to ${action} student`;
      toast.error(errorMessage);
    }
  };

  function getPageLink(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) {
      return;
    }

    let link = `${globalThis.location.pathname}?page=${pageNum}&limit=${limit}`;
    if (course) {
      link += `&course=${course}`;
    }
    if (departments) {
      link += `&departments=${departments}`;
    }
    if (batches) {
      link += `&batches=${batches}`;
    }

    return link;
  }

  const prevLinkClass = page > 1 ? 'btn btn-sm btn-secondary' : 'btn btn-sm';
  const nextLinkClass =
    page < totalPages ? 'btn btn-sm btn-secondary' : 'btn btn-sm';

  return (
    <div className="p-2">
      <div>
        {students.length == 0 ? (
          <h3 className='p-2 text-center font-bold'>No students found!</h3>
        ) : (
          <table className="table text-center table-pin-rows">
            {/* head */}
            <thead className="text-base font-normal">
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Department</th>
                <th>Status</th>
                <th>Password Reset</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.rollNo}</td>
                  <td>{student.name}</td>
                  <td>{student.courseName}</td>
                  <td>{student.batchYear}</td>
                  <td>{student.departmentName}</td>
                  <td>
                    {student.isBlocked ? (
                      <span className="badge badge-error">Blocked</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    {student.forcePasswordReset ? (
                      <span className="badge badge-warning">Required</span>
                    ) : (
                      <span className="badge badge-ghost">Not Required</span>
                    )}
                  </td>
                  <td className="flex flex-wrap gap-x-2 gap-y-2 justify-center">
                    <button
                      className="text-lg"
                      onClick={() => {
                        dispatch(setModalData({ student }));
                        document
                          .getElementById('addSingleStudentModal')
                          .showModal();
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-lg"
                      onClick={() => handleDeleteStudent(student._id)}
                    >
                      <MdDelete />
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() =>
                        handleToggleBlock(student._id, student.isBlocked)
                      }
                    >
                      {student.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-between p-2">
          <Link to={getPageLink(page - 1)} className={prevLinkClass}>
            Prev
          </Link>
          <Link to={getPageLink(page + 1)} className={nextLinkClass}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
};
export default StudentsTable;
