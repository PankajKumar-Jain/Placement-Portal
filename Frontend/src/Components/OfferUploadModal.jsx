import { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';

const OfferUploadModal = ({ applicationId, onClose }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: offerData } = useQuery({
    queryKey: ['offer-details', applicationId],
    queryFn: async () => {
      const { data } = await customFetch.get(`/company/applications/${applicationId}/offer`);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      await customFetch.post(`/company/applications/${applicationId}/offer-letter`, formData);
    },
    onSuccess: () => {
      toast.success('Offer letter uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['offer-details', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to upload offer letter');
    },
  });

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('offerLetter', file);

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('document') && !selectedFile.type.includes('word')) {
        toast.error('Please upload a PDF or document file');
        return;
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const offer = offerData?.offer;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Upload Offer Letter</h2>

        {offer?.status === 'accepted' ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                The student has accepted the offer. You can now upload the offer letter document.
              </p>

              {offer?.offerLetter && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Offer letter already uploaded
                  </p>
                  <a
                    href={offer.offerLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline block mt-2"
                  >
                    View Current Offer Letter
                  </a>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select PDF or Document</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={uploadMutation.isPending}
                  className="file-input file-input-bordered w-full"
                />
                {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-ghost flex-1"
                disabled={uploadMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
            <p>You can only upload an offer letter after the student accepts the offer.</p>
            <p className="text-sm mt-2">
              Current status: <span className="font-medium">{offer?.status?.toUpperCase()}</span>
            </p>
            <button onClick={onClose} className="btn btn-sm btn-ghost mt-4 w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferUploadModal;