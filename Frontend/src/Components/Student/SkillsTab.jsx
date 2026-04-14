import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { useState } from 'react';
import { Form, redirect } from 'react-router-dom';
import { FormInput } from '../';
import { setSkills } from '../../features/studentProfile/studentProfileSlice';
import { toast } from 'react-toastify';
import { customFetch, fetchStudentSkills } from '../../utils';
import { useQueryClient } from '@tanstack/react-query';

const SkillsTab = () => {
  const { skills, type } = useSelector((state) => state?.studentProfileState);

  const [modalData, setModalData] = useState({ action: 'create', skill: '' });
  return (
    <>
      <input
        type="radio"
        name="details3"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="skills"
        defaultChecked={true}
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <SkillModal modalData={modalData} />
        <div className="flex justify-between">
          <h3 className="text-2xl font-medium">Skills</h3>
          {type === 'private' && (
            <button
              className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
              onClick={() => {
                setModalData({ action: 'create', skill: "" });
                document.getElementById('skillModal').showModal();
                document.getElementById('skillFormError').innerText = '';
              }}
            >
              <FaPlusSquare />
              New
            </button>
          )}
        </div>

        {skills?.length ? (
          <div className="mt-4 border-x-2 border-t-2 border-black">
            {skills.map((skill, index) => (
              <SkillContainer
                key={index}
                skill={skill}
                setModalData={setModalData}
                type={type}
              />
            ))}
          </div>
        ) : (
          <div>No skills found</div>
        )}
      </div>
    </>
  );
};

const SkillContainer = ({ skill, setModalData, type }) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (
    <div className="flex justify-between py-2 px-4 border-b-2 border-black w-full">
      <h4>{skill}</h4>
      {type === 'private' && (
        <div className="flex gap-x-2">
          <button
            onClick={() => {
              setModalData({ action: 'update', skill });
              document.getElementById('skillModal').showModal();
              document.getElementById('skillFormError').innerText = '';
            }}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteSkill({ queryClient, dispatch, skill })}
          >
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

const SkillModal = ({ modalData }) => {
  const { action, skill } = modalData;
  return (
    <dialog id="skillModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} skill
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          id="skillForm"
          name="skillForm"
        >
          {action === 'update' && (
            <input type="text" name="oldSkill" defaultValue={skill} hidden />
          )}
          <FormInput
            label="skill"
            name={action === 'create' ? 'skill' : 'updatedSkill'}
            type="text"
            defaultValue={action === 'update' ? skill : ''}
          />

          <div id="skillFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Skill`}
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

async function handleDeleteSkill({ queryClient, dispatch, skill }) {
  try {
    await customFetch.delete(`/student/skills`, {
      data: { skill },
    });
    queryClient.removeQueries({ queryKey: ['skills'] });
    const { skills } = await queryClient.fetchQuery(fetchStudentSkills());
    dispatch(setSkills({ skills }));
    toast.success('Skill deleted successfully!');
    return redirect('/student-dashboard/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete skill!';
    toast.error(errorMessage);
    return error;
  }
}

export default SkillsTab;
