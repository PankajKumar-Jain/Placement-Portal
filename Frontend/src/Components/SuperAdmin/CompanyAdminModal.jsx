import { Form } from 'react-router-dom';
import { FormInput } from '../';
import { useSelector } from 'react-redux';

const CompanyAdminModal = () => {
  const { action, admin, companyId, companyName } = useSelector(
    (state) => state.companyAdminModalState
  );
  return (
    <dialog id="companyAdminModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {companyName} - {action} admin
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="companyAdminForm"
        >
          <input type="text" name="companyId" defaultValue={companyId} hidden />
          {action === 'update' && (
            <input type="text" name="adminId" defaultValue={admin._id} hidden />
          )}
          <FormInput
            label="name"
            name="companyAdminName"
            type="text"
            defaultValue={admin?.name}
          />

          <FormInput
            label="email"
            name="companyAdminEmail"
            type="email"
            defaultValue={admin?.email}
          />

          {action === 'add' && (
            <>
              <FormInput
                label="Password"
                name="companyAdminPassword"
                type="password"
              />

              <FormInput
                label="Confirm Password"
                name="confirmAdminPassword"
                type="password"
              />
            </>
          )}

          <FormInput
            label="Role"
            name="adminRole"
            type="text"
            defaultValue={admin?.companyRole}
          />

          <div id="companyAdminFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}CompanyAdmin`}
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
export default CompanyAdminModal;
