import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';
import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const BatchesTab = ({ batches, courseId, setModalData }) => {
  return (
    <>
      <input
        type="radio"
        name={`course-tab-${courseId}`}
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="batches"
        defaultChecked={false}
      />
      <div role="tabpanel" className="mt-4 tab-content">
        <div className="flex justify-between">
          <h3 className="text-xl font-medium">Batches</h3>
          <button
            className="flex items-center tracking-wide h-8 gap-x-2 font-semibold bg-green-500 px-2 rounded text-white hover:shadow-lg"
            onClick={() => {
              setModalData({ action: 'add', courseId });
              document.getElementById('batchModal').showModal();
              document.getElementById('batchFormError').innerText = '';
            }}
          >
            <FaPlusSquare />
            New
          </button>
        </div>

        {batches?.length ? (
          <div className="mt-4 border-x-2 border-t-2 border-black">
            {batches.map((batch) => (
              <BatchContainer
                key={batch.batchId}
                batch={batch}
                setModalData={setModalData}
                courseId={courseId}
              />
            ))}
          </div>
        ) : (
          <div>No batches found</div>
        )}
      </div>
    </>
  );
};

const BatchContainer = ({ batch, setModalData, courseId }) => {
  const queryClient = useQueryClient();

  return (
    <div className="flex justify-between py-2 px-4 border-b-2 border-black w-full">
      <h4>{batch.batchYear}</h4>
      <div className="flex gap-x-2">
        <button
          onClick={() => {
            setModalData({ action: 'update', batch, courseId });
            document.getElementById('batchModal').showModal();
            document.getElementById('batchFormError').innerText = '';
          }}
        >
          <FaEdit />
        </button>
        {/* <button onClick={() => handleDeletebatch({ queryClient, batch })}>
          <FaTrash />
        </button> */}
      </div>
    </div>
  );
};

async function handleDeletebatch({ queryClient, dispatch, skill }) {
  try {
    await customFetch.delete(`/admin/courses/`);
    toast.success('batch deleted successfully!');
    return redirect('/admin-dashboard/courses');
  } catch (error) {
    console.log(error);
    const errorMessage =
      error?.response?.data?.message || 'Failed to delete batch!';
    toast.error(errorMessage);
    return error;
  }
}

export default BatchesTab;
