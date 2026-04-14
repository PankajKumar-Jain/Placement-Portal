import { useState, useEffect } from 'react';

const ResumeForm = ({ initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    header: {
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      email: '',
      phone: '',
    },
    education: [],
    experience: [],
    leadership: [],
    skills: {
      technical: '',
      languages: '',
      laboratory: '',
    },
    interests: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [name]: value,
      },
    }));
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [name]: value,
      },
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      education: newEducation,
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          concentration: '',
          gpa: '',
          graduationMonth: '',
          graduationYear: '',
          city: '',
          state: '',
          relevantCoursework: '',
          thesis: '',
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      experience: newExperience,
    }));
  };

  const handleBulletPoint = (sectionIndex, bulletIndex, value, section = 'experience') => {
    const sectionData = formData[section];
    const newSection = [...sectionData];
    if (!newSection[sectionIndex].bulletPoints) {
      newSection[sectionIndex].bulletPoints = [];
    }
    if (!newSection[sectionIndex].bulletPoints[bulletIndex]) {
      newSection[sectionIndex].bulletPoints[bulletIndex] = { text: '' };
    }
    newSection[sectionIndex].bulletPoints[bulletIndex].text = value;
    setFormData((prev) => ({
      ...prev,
      [section]: newSection,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          organization: '',
          positionTitle: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          city: '',
          location: '',
          bulletPoints: [],
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addLeadership = () => {
    setFormData((prev) => ({
      ...prev,
      leadership: [
        ...prev.leadership,
        {
          organization: '',
          role: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: '',
          isCurrent: false,
          city: '',
          state: '',
          bulletPoints: [],
        },
      ],
    }));
  };

  const removeLeadership = (index) => {
    setFormData((prev) => ({
      ...prev,
      leadership: prev.leadership.filter((_, i) => i !== index),
    }));
  };

  const handleLeadershipChange = (index, field, value) => {
    const newLeadership = [...formData.leadership];
    newLeadership[index] = {
      ...newLeadership[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      leadership: newLeadership,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-2xl font-bold">Resume Details</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>

      {/* Header Section */}
      <section className="border-b pb-6">
        <h3 className="text-lg font-bold mb-4">Header Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            name="firstName"
            value={formData.header.firstName}
            onChange={handleHeaderChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lastName"
            value={formData.header.lastName}
            onChange={handleHeaderChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Address"
            name="address"
            value={formData.header.address}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="City"
            name="city"
            value={formData.header.city}
            onChange={handleHeaderChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="State"
            name="state"
            value={formData.header.state}
            onChange={handleHeaderChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            name="zipCode"
            value={formData.header.zipCode}
            onChange={handleHeaderChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.header.email}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="tel"
            placeholder="Phone"
            name="phone"
            value={formData.header.phone}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="url"
            placeholder="LinkedIn Profile URL"
            name="linkedIn"
            value={formData.header.linkedIn || ''}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="url"
            placeholder="GitHub Profile URL"
            name="github"
            value={formData.header.github || ''}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
          <input
            type="url"
            placeholder="LeetCode Profile URL"
            name="leetcode"
            value={formData.header.leetcode || ''}
            onChange={handleHeaderChange}
            className="col-span-2 border rounded px-3 py-2"
          />
        </div>
      </section>

      {/* Education Section */}
      <section className="border-b pb-6">
        <h3 className="text-lg font-bold mb-4">Education</h3>
        {formData.education.map((edu, idx) => (
          <div key={idx} className="mb-6 p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Concentration"
                value={edu.concentration}
                onChange={(e) => handleEducationChange(idx, 'concentration', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="GPA"
                value={edu.gpa}
                onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Graduation Month"
                value={edu.graduationMonth}
                onChange={(e) => handleEducationChange(idx, 'graduationMonth', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Graduation Year"
                value={edu.graduationYear}
                onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Relevant Coursework"
                value={edu.relevantCoursework}
                onChange={(e) => handleEducationChange(idx, 'relevantCoursework', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={() => removeEducation(idx)}
              className="bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addEducation}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Add Education
        </button>
      </section>

      {/* Experience Section */}
      <section className="border-b pb-6">
        <h3 className="text-lg font-bold mb-4">Experience (Max 3)</h3>
        {formData.experience.slice(0, 3).map((exp, idx) => (
          <div key={idx} className="mb-6 p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Organization"
                value={exp.organization}
                onChange={(e) => handleExperienceChange(idx, 'organization', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Position Title"
                value={exp.positionTitle}
                onChange={(e) => handleExperienceChange(idx, 'positionTitle', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Start Month"
                value={exp.startMonth}
                onChange={(e) => handleExperienceChange(idx, 'startMonth', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Start Year"
                value={exp.startYear}
                onChange={(e) => handleExperienceChange(idx, 'startYear', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="End Month"
                value={exp.endMonth}
                onChange={(e) => handleExperienceChange(idx, 'endMonth', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={exp.isCurrent}
                  onChange={(e) => handleExperienceChange(idx, 'isCurrent', e.target.checked)}
                  className="mr-2"
                />
                <label>Currently working here</label>
              </div>
            </div>
            <div className="text-sm font-semibold mb-2">Bullet Points (Max 4)</div>
            {[0, 1, 2, 3].map((bulletIdx) => (
              <input
                key={bulletIdx}
                type="text"
                placeholder={`Bullet ${bulletIdx + 1}`}
                value={exp.bulletPoints?.[bulletIdx]?.text || ''}
                onChange={(e) =>
                  handleBulletPoint(idx, bulletIdx, e.target.value, 'experience')
                }
                className="w-full border rounded px-3 py-2 mb-2"
              />
            ))}
            <button
              onClick={() => removeExperience(idx)}
              className="bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        {formData.experience.length < 3 && (
          <button
            onClick={addExperience}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Experience
          </button>
        )}
      </section>

      {/* Leadership Section */}
      <section className="border-b pb-6">
        <h3 className="text-lg font-bold mb-4">Leadership & Activities (Max 2)</h3>
        {formData.leadership.slice(0, 2).map((lead, idx) => (
          <div key={idx} className="mb-6 p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Organization"
                value={lead.organization}
                onChange={(e) => handleLeadershipChange(idx, 'organization', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Role"
                value={lead.role}
                onChange={(e) => handleLeadershipChange(idx, 'role', e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Start Month"
                value={lead.startMonth}
                onChange={(e) => handleLeadershipChange(idx, 'startMonth', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Start Year"
                value={lead.startYear}
                onChange={(e) => handleLeadershipChange(idx, 'startYear', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="End Month"
                value={lead.endMonth}
                onChange={(e) => handleLeadershipChange(idx, 'endMonth', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={lead.isCurrent}
                  onChange={(e) => handleLeadershipChange(idx, 'isCurrent', e.target.checked)}
                  className="mr-2"
                />
                <label>Currently in this role</label>
              </div>
            </div>
            <div className="text-sm font-semibold mb-2">Bullet Points (Max 3)</div>
            {[0, 1, 2].map((bulletIdx) => (
              <input
                key={bulletIdx}
                type="text"
                placeholder={`Bullet ${bulletIdx + 1}`}
                value={lead.bulletPoints?.[bulletIdx]?.text || ''}
                onChange={(e) =>
                  handleBulletPoint(idx, bulletIdx, e.target.value, 'leadership')
                }
                className="w-full border rounded px-3 py-2 mb-2"
              />
            ))}
            <button
              onClick={() => removeLeadership(idx)}
              className="bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        {formData.leadership.length < 2 && (
          <button
            onClick={addLeadership}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Leadership
          </button>
        )}
      </section>

      {/* Skills Section */}
      <section>
        <h3 className="text-lg font-bold mb-4">Skills & Interests</h3>
        <div className="space-y-4">
          <textarea
            placeholder="Technical Skills (comma-separated)"
            name="technical"
            value={formData.skills.technical}
            onChange={handleSkillsChange}
            className="w-full border rounded px-3 py-2 h-20"
          />
          <textarea
            placeholder="Languages (comma-separated)"
            name="languages"
            value={formData.skills.languages}
            onChange={handleSkillsChange}
            className="w-full border rounded px-3 py-2 h-12"
          />
          <textarea
            placeholder="Laboratory/Tools (comma-separated)"
            name="laboratory"
            value={formData.skills.laboratory}
            onChange={handleSkillsChange}
            className="w-full border rounded px-3 py-2 h-20"
          />
          <textarea
            placeholder="Interests"
            value={formData.interests}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                interests: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2 h-12"
          />
        </div>
      </section>

      <div className="sticky bottom-0 bg-white py-4 border-t">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>
    </div>
  );
};

export default ResumeForm;
