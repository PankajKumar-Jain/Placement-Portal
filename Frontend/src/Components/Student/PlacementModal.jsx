import { Form } from 'react-router-dom';
import { FormInput, FileInput, DateInput, NumberInput } from '../';
import { formatDate } from '../../utils';

const PlacementModal = ({ modalData }) => {
  const { action, placement, onCampus, applicationId } = modalData;
  return (
    <dialog id="placementModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} placement
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="placementForm"
          encType="multipart/form-data"
        >
          {action === 'update' && (
            <input
              type="text"
              name="placementId"
              defaultValue={placement?._id}
              hidden
            />
          )}

          {onCampus ? (
            <>
              <input
                type="text"
                defaultValue={applicationId}
                name="applicationId"
                hidden
              />
            </>
          ) : (
            <>
              <FormInput
                label="job profile *"
                name="jobProfile"
                type="text"
                defaultValue={placement?.jobProfile}
              />
              <FormInput
                label="company *"
                name="company"
                type="text"
                defaultValue={placement?.company}
              />
              <FormInput
                label="location *"
                name="location"
                type="text"
                defaultValue={placement?.location}
              />
              <NumberInput
                label="package (LPA) *"
                name="package"
                defaultValue={placement?.package}
              />
            </>
          )}
          <FileInput
            label="offer letter *"
            name="offerLetter"
            accept="application/pdf"
            isRequired={true}
          />
          <FileInput
            label="joining letter"
            name="joiningLetter"
            accept="application/pdf"
          />
          <DateInput
            label="joining Date"
            name="joiningDate"
            size="w-fit"
            defaultValue={
              placement?.joiningDate &&
              formatDate(new Date(placement?.joiningDate))
            }
            isRequired={false}
          />

          <p className="italic text-red-500">* indicates required fields</p>

          <div id="placementFormError" className="text-red-500"></div>
          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Placement`}
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
export default PlacementModal;
