import { redirect } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { customFetch, fetchStudentEducation } from '../../utils';

import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { setEducationDetails } from '../../features/studentProfile/studentProfileSlice';

const PastScoreContainer = ({ type, label, data, setModalData }) => {
  const { year, score, scale, board, institute, stream } = data;

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (
    <div className="lg:min-w-80 sm:max-w-96 rounded border shadow p-4">
      <div className="flex justify-between">
        <h3 className="capitalize tracking-wide text-xl font-semibold">
          {label}
        </h3>
        {type === 'private' && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setModalData({ action: 'update', data, label, open: true });
                document.getElementById('pastScoreError').innerText = '';
                document.getElementById('pastScoreModal').showModal();
              }}
            >
              <FaEdit />
            </button>
            <button
              onClick={() =>
                handleDeletePastEducation({ queryClient, dispatch, label })
              }
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-y-1">
        <p>
          <span className="font-medium tracking-wide">Institute:</span>{' '}
          <span>{institute}</span>
        </p>
        <p>
          <span className="font-medium tracking-wide">Year:</span>{' '}
          <span>{year}</span>
        </p>
        <p>
          <span className="font-medium tracking-wide">Board:</span>{' '}
          <span>{board}</span>
        </p>
        {stream && (
          <p>
            <span className="font-medium tracking-wide">Stream:</span>{' '}
            <span>{stream}</span>
          </p>
        )}
        <p>
          <span className="font-medium tracking-wide">Score:</span>{' '}
          <span>
            {score}
            {scale === 'GPA' ? ' GPA' : '%'}
          </span>
        </p>
      </div>
    </div>
  );
};

async function handleDeletePastEducation({ queryClient, dispatch, label }) {
  try {
    await customFetch.delete(`/student/education/${label}`);
    queryClient.removeQueries({ queryKey: ['education'] });
    const { educationDetails } = await queryClient.fetchQuery(
      fetchStudentEducation()
    );
    dispatch(setEducationDetails({ educationDetails }));
    toast.success(`${label} record deleted successfully!`);
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || `Failed to delete ${label} record!`;
    toast.error(errorMessage);
    return error;
  }
}

export default PastScoreContainer;
