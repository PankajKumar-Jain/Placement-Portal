import { redirect } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { customFetch, fetchStudentPlacements } from '../../utils';
import { setPlacements } from '../../features/studentProfile/studentProfileSlice';
import PlacementModal from './PlacementModal';

const StudentPlacement = () => {
  const placements = useSelector(
    (state) => state?.studentProfileState?.placements
  );
  const [modalData, setModalData] = useState({
    action: 'create',
    onCampus: false,
  });

  return (
    <>
      <input
        type="radio"
        name="details2"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="placements"
        defaultChecked={true}
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <PlacementModal modalData={modalData} />
        <div className="flex justify-between">
          <h3 className="text-2xl font-medium">Placements</h3>
          <button
            className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
            onClick={() => {
              setModalData({ action: 'create', onCampus: false });
              document.getElementById('placementModal').showModal();
            }}
          >
            <FaPlusSquare />
            New
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3">
          {placements?.length ? (
            placements.map((placement) => (
              <PlacementContainer
                key={placement._id}
                placement={placement}
                setModalData={setModalData}
              />
            ))
          ) : (
            <p>No placements found!</p>
          )}
        </div>
      </div>
    </>
  );
};

const PlacementContainer = ({ placement, setModalData }) => {
  const {
    jobProfile,
    company,
    location,
    package: packageAMT,
    offerLetter,
    joiningLetter,
    isOnCampus,
  } = placement;
  let { joiningDate } = placement;

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  if (joiningDate) joiningDate = new Date(joiningDate).toLocaleDateString();

  return (
    <div className="max-w-80 sm:max-w-96 rounded border shadow p-4">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold tracking-wider">{jobProfile}</h3>
        {isOnCampus ? (
          <p className="badge-success text-white rounded px-2">on campus</p>
        ) : (
          <div className="flex flex-row gap-x-2">
            <button
              onClick={() => {
                setModalData({
                  action: 'update',
                  placement,
                  onCampus: false,
                });
                document.getElementById('placementFormError').innerText = '';
                document.getElementById('placementModal').showModal();
              }}
            >
              <FaEdit />
            </button>
            <button
              onClick={() =>
                handleDeletePlacement({
                  dispatch,
                  queryClient,
                  id: placement._id,
                })
              }
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-y-2">
        <p>
          <span className="font-medium">Company: </span>
          <span>{company}</span>
        </p>
        <p>
          <span className="font-medium">Package: </span>
          <span>{packageAMT} LPA</span>
        </p>
        <p>
          <span className="font-medium">Location: </span>
          <span>{location}</span>
        </p>
        {joiningDate && (
          <p>
            <span className="font-medium">Joining Date: </span>
            <span>{joiningDate}</span>
          </p>
        )}
        {offerLetter && (
          <p>
            <span className="font-medium">Offer Letter: </span>
            <a href={offerLetter} target="_blank" className="link">View File</a>
          </p>
        )}
        {joiningLetter && (
          <p>
            <span className="font-medium">Joining Letter: </span>
            <a href={joiningLetter} target="_blank" className="link">
              View File
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

async function handleDeletePlacement({ queryClient, dispatch, id }) {
  try {
    await customFetch.delete(`/student/placement/${id}`);
    queryClient.removeQueries({ queryKey: ['placements'] });
    const { placements } = await queryClient.fetchQuery(
      fetchStudentPlacements()
    );
    dispatch(setPlacements({ placements }));
    toast.success('Placement deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete placement!';
    toast.error(errorMessage);
    return error;
  }
}

export default StudentPlacement;
