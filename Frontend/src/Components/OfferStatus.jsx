import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
import { setUser } from '../features/user/userSlice';

const OfferStatus = () => {
  const queryClient = useQueryClient();

  const { data: offerData, isLoading: offerLoading } = useQuery({
    queryKey: ['offer-status'],
    queryFn: async () => {
      const { data } = await customFetch.get('/student/offer');
      return data;
    },
  });

  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.userState.user);

  const acceptMutation = useMutation({
    mutationFn: () => customFetch.post('/student/offer/accept'),
    onSuccess: () => {
      toast.success('Offer accepted successfully!');
      queryClient.invalidateQueries({ queryKey: ['offer-status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      dispatch(
        setUser({
          user: {
            ...currentUser,
            hiredStatus: 'accepted',
          },
        })
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to accept offer');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => customFetch.post('/student/offer/reject'),
    onSuccess: () => {
      toast.success('Offer rejected');
      queryClient.invalidateQueries({ queryKey: ['offer-status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['single-job-applications'] });
      dispatch(
        setUser({
          user: {
            ...currentUser,
            hiredStatus: 'rejected',
          },
        })
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reject offer');
    },
  });

  const handleAccept = async () => {
    if (window.confirm('Are you sure you want to accept this offer?')) {
      acceptMutation.mutate();
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this offer? This action cannot be undone.')) {
      rejectMutation.mutate();
    }
  };

  if (offerLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!offerData?.offer) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-blue-900">Offer Status</h3>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
            No Offer
          </span>
        </div>
        <div>
          <p className="text-blue-800">
            No active offer is available right now. Once a company hires you, the offer details will appear here.
          </p>
          {offerData?.message && (
            <p className="mt-2 text-sm text-slate-600">{offerData.message}</p>
          )}
        </div>
      </div>
    );
  }

  const { offer } = offerData;
  const isPending = offer.status === 'pending';

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-blue-900">Offer Status</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            offer.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : offer.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-blue-800">
          Congratulations! You have received an offer for the position.
        </p>
        {offer.offerLetter && (
          <p className="text-blue-800 mt-2">
            <a
              href={offer.offerLetter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Offer Letter
            </a>
          </p>
        )}
      </div>

      {isPending && (
        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept Offer'}
          </button>
          <button
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Offer'}
          </button>
        </div>
      )}

      {offer.status === 'accepted' && (
        <div className="text-green-800 font-medium">
          ✓ You have accepted this offer. Congratulations!
        </div>
      )}

      {offer.status === 'rejected' && (
        <div className="text-red-800 font-medium">
          ✗ You have rejected this offer.
        </div>
      )}
    </div>
  );
};

export default OfferStatus;