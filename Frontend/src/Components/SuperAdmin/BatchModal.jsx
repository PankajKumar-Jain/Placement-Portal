import { Form } from 'react-router-dom';
import { FormInput } from '../';

const BatchModal = ({ modalData }) => {
  const { action, batch, courseId } = modalData;
  return (
    <dialog id="batchModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} batch
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="batchForm"
        >
          <input type="text" name="courseId" defaultValue={courseId} hidden />
          {action === 'update' && (
            <input
              type="text"
              name="batchId"
              defaultValue={batch?.batchId}
              hidden
            />
          )}
          <FormInput
            label="batch year"
            name="batchYear"
            type="text"
            defaultValue={batch?.batchYear}
          />

          <div id="batchFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Batch`}
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

export default BatchModal;
