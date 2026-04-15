import { Form, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

import { customFetch } from '../utils';

export const action = (store, setUser) => {
  return async function ({ request }) {
    const formData = await request.formData();
    try {
      await customFetch.post('/student/change-password', {
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
      });

      const { data } = await customFetch.get('/user/whoami');
      store.dispatch(setUser({ user: data.user }));

      toast.success('Password updated successfully');
      return redirect('/student-dashboard');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      return null;
    }
  };
};

const StudentPasswordReset = () => {
  return (
    <section className="p-6 max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow border border-base-300 p-6">
        <h2 className="text-2xl font-semibold mb-2">Password Reset Required</h2>
        <p className="text-sm mb-6">
          Your account requires a password update before continuing.
        </p>
        <Form method="post" className="flex flex-col gap-4">
          <input
            type="password"
            name="oldPassword"
            placeholder="Current password"
            className="input input-bordered"
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            className="input input-bordered"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            className="input input-bordered"
            required
          />
          <button type="submit" className="btn btn-primary">
            Update Password
          </button>
        </Form>
      </div>
    </section>
  );
};

export default StudentPasswordReset;
