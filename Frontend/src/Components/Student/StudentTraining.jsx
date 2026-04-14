import { Form, redirect } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { FormInput, FileInput, DateInput } from '../';
import { formatDate, customFetch, fetchStudentTrainings } from '../../utils';
import { setTrainings } from '../../features/studentProfile/studentProfileSlice';

const StudentTraining = () => {
  const { trainings, type } = useSelector(
    (state) => state?.studentProfileState
  );
  const [modalData, setModalData] = useState({ action: 'create' });

  return (
    <>
      <input
        type="radio"
        name="details2"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="training"
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <TrainingModal modalData={modalData} />
        <div className="flex justify-between">
          <h3 className="text-2xl font-medium">Trainings</h3>
          {type === 'private' && (
            <button
              className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
              onClick={() => {
                setModalData({ action: 'create' });
                document.getElementById('trainingFormError').innerText = '';
                document.getElementById('trainingModal').showModal();
              }}
            >
              <FaPlusSquare />
              New
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3">
          {trainings?.length ? (
            trainings.map((training) => (
              <TrainingContainer
                key={training._id}
                training={training}
                setModalData={setModalData}
                type={type}
              />
            ))
          ) : (
            <p>No trainings found!</p>
          )}
        </div>
      </div>
    </>
  );
};

const TrainingContainer = ({ training, setModalData, type }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { trainingName, organisation, certificate } = training;
  let { startDate, endDate } = training;

  startDate = new Date(startDate).toLocaleDateString();
  if (endDate) endDate = new Date(endDate).toLocaleDateString();

  return (
    <div className="max-w-80 sm:max-w-96 rounded border shadow p-4">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold tracking-wider">{trainingName}</h3>
        {type === 'private' && (
          <div className="flex flex-row gap-x-2">
            <button
              onClick={() => {
                setModalData({
                  action: 'update',
                  training,
                });
                document.getElementById('trainingModal').showModal();
              }}
            >
              <FaEdit />
            </button>
            <button
              onClick={() =>
                handleDeleteTraining({
                  queryClient,
                  dispatch,
                  id: training._id,
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
          <span className="font-medium">Organisation: </span>
          <span>{organisation}</span>
        </p>
        <p>
          <span className="font-medium">Start Date: </span>
          <span>{startDate}</span>
        </p>
        {endDate && (
          <p>
            <span className="font-medium">End Date: </span>
            <span>{endDate}</span>
          </p>
        )}
        {certificate && (
          <p>
            <span className="font-medium">Certificate: </span>
            <a href={certificate} className="link link-primary" target="_blank">
              View File
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

const TrainingModal = ({ modalData }) => {
  const { action, training } = modalData;
  return (
    <dialog id="trainingModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} training
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="trainingForm"
          encType="multipart/form-data"
        >
          {action === 'update' && (
            <input
              type="text"
              name="trainingId"
              defaultValue={training?._id}
              hidden
            />
          )}
          <FormInput
            label="training name"
            name="trainingName"
            type="text"
            defaultValue={training?.trainingName}
          />
          <FormInput
            label="organisation"
            name="organisation"
            type="text"
            defaultValue={training?.organisation}
          />
          <FileInput
            label="certificate"
            name="certificate"
            accept="application/pdf"
          />
          {training?.certificate && (
            <div>
              <a
                href={training?.certificate}
                target="_blank"
                className="text-sm link link-primary"
              >
                View Current File
              </a>
            </div>
          )}
          <DateInput
            label="Start Date"
            name="startDate"
            size="w-fit"
            defaultValue={
              training?.startDate && formatDate(new Date(training?.startDate))
            }
            maxDate={formatDate(new Date())}
          />
          <DateInput
            label="End Date"
            name="endDate"
            size="w-fit"
            defaultValue={
              training?.endDate && formatDate(new Date(training?.endDate))
            }
            maxDate={formatDate(new Date())}
          />

          <div id="trainingFormError" className="text-red-500"></div>
          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Training`}
          >
            {action}
          </button>
        </Form>
        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-lg btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

async function handleDeleteTraining({ queryClient, dispatch, id }) {
  try {
    await customFetch.delete(`/student/training/${id}`);
    queryClient.removeQueries({ queryKey: ['trainings'] });
    const { trainings } = await queryClient.fetchQuery(fetchStudentTrainings());
    dispatch(setTrainings({ trainings }));
    toast.success('Training deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete training!';
    toast.error(errorMessage);
    return error;
  }
}

export default StudentTraining;
