import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import ResumeForm from '../Components/ResumeBuilder/ResumeForm';
import ResumePreview from '../Components/ResumeBuilder/ResumePreview';

export const loader = (queryClient) => {
  return async function () {
    try {
      const { resume } = await queryClient.ensureQueryData({
        queryKey: ['resume'],
        queryFn: async () => {
          const { data } = await customFetch.get('/student/resume');
          return data;
        },
      });
      return { resume };
    } catch (error) {
      console.log(error);
      return { resume: null };
    }
  };
};

const ResumeBuilder = () => {
  const queryClient = useQueryClient();
  const [resumeData, setResumeData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: resumeRes, isLoading } = useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data } = await customFetch.get('/student/resume');
      setResumeData(data.resume);
      return data.resume;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data } = await customFetch.post('/student/resume', updatedData);
      return data.resume;
    },
    onSuccess: (updated) => {
      setResumeData(updated);
      queryClient.setQueryData(['resume'], updated);
      toast.success('Resume saved successfully!');
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to save resume');
      setIsSaving(false);
    },
  });

  const handleSaveResume = async (data) => {
    setIsSaving(true);
    updateMutation.mutate(data);
  };

  const downloadPDF = async () => {
    try {
      const response = await customFetch.get('/student/resume/download', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${resumeData?.header?.firstName || 'Resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error?.response?.data?.message || 'Failed to download resume');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">
            Build your professional resume using our standard 1-page template
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-md p-6 max-h-[90vh] overflow-y-auto">
            <ResumeForm
              initialData={resumeData}
              onSave={handleSaveResume}
              isSaving={isSaving}
            />
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={downloadPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={!resumeData}
              >
                Download as PDF
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg max-h-[85vh] overflow-y-auto border border-gray-200">
              <ResumePreview data={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
