import { Form, redirect } from 'react-router-dom';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';

import { setUser } from '../features/user/userSlice';
import { FormInput } from '../Components';

export function loader(store) {
  return async function () {
    try {
      const { data } = await customFetch.get('/user/whoami');
      const { user } = data;
      store.dispatch(setUser({ user }));
      const role = user.role;
      if (role == 'student') return redirect('/student-dashboard');
      if (role == 'company_admin') return redirect('/company-dashboard');
      if (role == 'admin') return redirect('/admin-dashboard');
    } catch (error) {
      return null;
    }
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post('/auth/login', data);
    toast.success('Login successful!');
    return redirect('/');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'please double check your credentials';
    toast.error(errorMessage);
    return null;
  }
}

const Login = () => {
  return (
    <section className="h-screen grid place-items-center bg-gray-100">
      <Form
        method="POST"
        className="card lg:w-96 p-8 bg-slate-600 shadow-lg flex flex-col gap-y-4"
      >
        <h4 className="text-center text-white font-bold text-3xl">Login</h4>
        <FormInput type="email" name="email" label="email" labelColor="white" />
        <FormInput
          type="password"
          name="password"
          label="password"
          labelColor="white"
        />
        <button type="submit" className="btn btn-success text-white text-lg">
          Login
        </button>
      </Form>
    </section>
  );
};
export default Login;
