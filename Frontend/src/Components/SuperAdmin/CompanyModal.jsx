import { Form } from 'react-router-dom';
import { FormInput, Textarea } from '../';
import { useSelector } from 'react-redux';

const CompanyModal = () => {
  const { action, company } = useSelector((state) => state.companyModalState);

  const formatAccessTill = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };
  return (
    <dialog id="companyModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} company
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="companyForm"
        >
          {action === 'update' && (
            <input
              type="text"
              name="companyId"
              defaultValue={company?._id}
              hidden
            />
          )}
          <FormInput
            label="company name"
            name="companyName"
            type="text"
            defaultValue={company?.name || ''}
          />

          <FormInput
            label="company email"
            name="companyEmail"
            type="email"
            defaultValue={company?.email || ''}
          />

          <FormInput
            label="website"
            name="website"
            type="url"
            defaultValue={company?.website || ''}
          />

          <FormInput
            label="Dashboard Access Till"
            name="accessTill"
            type="date"
            defaultValue={formatAccessTill(company?.accessTill)}
          />

          <Textarea
            label="about"
            name="about"
            placeholder="Write a bit about company..."
            defaultValue={company?.about || ''}
          />

          <div id="companyFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}Company`}
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
export default CompanyModal;
