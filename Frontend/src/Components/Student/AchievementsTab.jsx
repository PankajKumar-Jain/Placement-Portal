import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { useState } from 'react';
import { Form, redirect } from 'react-router-dom';
import { FormInput } from '../';
import { setAchievements } from '../../features/studentProfile/studentProfileSlice';
import { toast } from 'react-toastify';
import { customFetch, fetchStudentAchievements } from '../../utils';
import { useQueryClient } from '@tanstack/react-query';

const AchievementsTab = () => {
  const { achievements, type } = useSelector(
    (state) => state?.studentProfileState
  );
  const [modalData, setModalData] = useState({ action: 'create', achievement: '' });
  return (
    <>
      <input
        type="radio"
        name="details3"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="achievements"
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <AchievementModal modalData={modalData} />
        <div className="flex justify-between">
          <h3 className="text-2xl font-medium">Achievements</h3>
          {type === 'private' && (
            <button
              className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
              onClick={() => {
                setModalData({ action: 'create', achievement: '' });
                document.getElementById('achievementModal').showModal();
                document.getElementById('achievementFormError').innerText = '';
              }}
            >
              <FaPlusSquare />
              New
            </button>
          )}
        </div>

        {achievements?.length ? (
          <div className="mt-4 border-x-2 border-t-2 border-black">
            {achievements.map((achievement, index) => (
              <AchievementContainer
                achievement={achievement}
                key={index}
                setModalData={setModalData}
                type={type}
              />
            ))}
          </div>
        ) : (
          <div>No achievements found!</div>
        )}
      </div>
    </>
  );
};

const AchievementContainer = ({ achievement, setModalData, type }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return (
    <div className="flex justify-between py-2 px-4 border-b-2 border-black w-full">
      <h4>{achievement}</h4>
      {type === 'private' && (
        <div className="flex gap-x-2">
          <button
            onClick={() => {
              setModalData({ action: 'update', achievement });
              document.getElementById('achievementModal').showModal();
              document.getElementById('achievementFormError').innerText = '';
            }}
          >
            <FaEdit />
          </button>
          <button
            onClick={() =>
              handleDeleteAchievement({ queryClient, dispatch, achievement })
            }
          >
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

const AchievementModal = ({ modalData }) => {
  const { action, achievement } = modalData;
  return (
    <dialog id="achievementModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} achievement
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="achievementForm"
          id="achievementForm"
        >
          {action === 'update' && (
            <input
              type="text"
              name="oldAchievement"
              defaultValue={achievement || ''}
              hidden
            />
          )}
          <FormInput
            label="achievement"
            name={action === 'create' ? 'achievement' : 'updatedAchievement'}
            type="text"
            defaultValue={action === 'update' ? achievement : ''}
          />

          <div id="achievementFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Achievement`}
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

async function handleDeleteAchievement({ queryClient, dispatch, achievement }) {
  try {
    await customFetch.delete(`/student/achievements`, {
      data: { achievement },
    });
    queryClient.removeQueries({ queryKey: ['achievements'] });
    const { achievements } = await queryClient.fetchQuery(
      fetchStudentAchievements()
    );
    dispatch(setAchievements({ achievements }));
    toast.success('Achievement deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete achievement!';
    toast.error(errorMessage);
    return error;
  }
}

export default AchievementsTab;
