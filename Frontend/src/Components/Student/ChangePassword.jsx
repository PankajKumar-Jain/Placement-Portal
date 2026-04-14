import { Form, useSubmit } from 'react-router-dom';
import { SimpleFormInput } from '../';

const ChangePassword = () => {
  const submit = useSubmit();

  const handleSubmit = (e) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('intent', 'changePassword');
    submit(formData, { method: 'post' });
  };

  return (
    <>
      <input
        type="radio"
        name="details"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="security"
      />

      <div role="tabpanel" className="mt-4 tab-content">
        <h3 className="text-2xl font-medium mb-4">Change Password</h3>
        <Form
          method="POST"
          className="flex flex-col gap-y-8"
          onSubmit={handleSubmit}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <SimpleFormInput
              name="oldPassword"
              type="password"
              label="Current Password"
            />
            <SimpleFormInput
              name="newPassword"
              type="password"
              label="New Password"
            />
            <SimpleFormInput
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning max-w-fit self-end text-white btn-sm h-9 px-4"
            name="intent"
            value="changePassword"
          >
            Change Password
          </button>
        </Form>
      </div>
    </>
  );
};

export default ChangePassword;
