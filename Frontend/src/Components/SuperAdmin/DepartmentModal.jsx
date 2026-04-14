import { Form } from 'react-router-dom';
import { FormInput } from '../';

const DepartmentModal = ({ modalData }) => {
  const { action, courseId, department } = modalData;
  return (
    <dialog id="departmentModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} department
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="departmentForm"
        >
          <input type="text" name="courseId" defaultValue={courseId} hidden />
          {action === 'update' && (
            <input
              type="text"
              name="departmentId"
              defaultValue={department?.departmentId}
              hidden
            />
          )}
          <FormInput
            label="department name"
            name="departmentName"
            type="text"
            defaultValue={department?.departmentName}
          />

          <FormInput
            label="department code"
            name="departmentCode"
            type="text"
            defaultValue={department?.departmentCode}
          />

          <div id="departmentFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Department`}
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
export default DepartmentModal;
