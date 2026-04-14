import { useRouteError } from 'react-router-dom';

const ErrorElement = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  return (
    <div className="space-y-4 p-6 text-center">
      <h4 className="font-bold text-4xl">There was an error...</h4>
      {error?.statusText && <p className="text-sm text-gray-600">{error.statusText}</p>}
      {error?.message && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};
export default ErrorElement;