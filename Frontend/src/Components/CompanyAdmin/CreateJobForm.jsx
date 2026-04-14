import { Form } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import {
  FormInput,
  Textarea,
  SelectInput,
  CheckboxInput,
  MultipleInputs,
  NumberInput,
  DateInput,
} from '../';

import {
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
  formatDate,
} from '../../utils';

const CreateJobForm = () => {
  const courseOptions = useSelector((state) => state.courseOptions);

  const jobData = useSelector((state) => state.jobCreateFormState);
  const receivingCourseId = jobData?.receivingCourse?.id;

  const defaultDeptOptions = receivingCourseId
    ? getDepartmentOptions(courseOptions[receivingCourseId]?.departments)
    : [];

  const defaultBatchOptions = receivingCourseId
    ? getBatchOptions(courseOptions[receivingCourseId]?.batches)
    : [];

  const [deptOptions, setDeptOptions] = useState(defaultDeptOptions);
  const [batchOptions, setBatchOptions] = useState(defaultBatchOptions);

  const [skillFields, setSkillFields] = useState(['']);
  const [defaultDeadline, setDefaultDeadline] = useState();

  useEffect(() => {
    setDeptOptions(defaultDeptOptions);
    setBatchOptions(defaultBatchOptions);
  }, [receivingCourseId]);

  useEffect(() => {
    if (jobData?.keySkills) {
      setSkillFields(jobData.keySkills);
    }
  }, [jobData.keySkills]);

  useEffect(() => {
    if (jobData?.deadline) {
      setDefaultDeadline(formatDate(new Date(jobData.deadline)));
    } else {
      const todayDate = new Date();
      const laterDate = new Date();
      laterDate.setMonth(todayDate.getMonth() + 1);
      setDefaultDeadline(formatDate(laterDate));
    }
  }, [jobData?.deadline]);

  async function handleCourseChange() {
    const courseId = document.getElementById('createJobCourse').value;

    if (!courseId || courseId == -1) {
      setDeptOptions([]);
      setBatchOptions([]);
    } else {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);
      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    }
  }

  return (
    <dialog id="createJobModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {jobData.action} Job
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name={`${jobData.action}JobForm`}
        >
          <input type="text" name="jobId" defaultValue={jobData?._id} hidden />

          <FormInput
            label="Profile"
            name="profile"
            type="text"
            defaultValue={jobData?.profile}
          />

          <Textarea
            label="Description"
            name="description"
            placeholder="Mention Job Qualifications and Responsibilities"
            defaultValue={jobData?.description || ''}
          />

          <SelectInput
            label="Select Course"
            options={getCourseOptions(courseOptions)}
            id="createJobCourse"
            changeFn={handleCourseChange}
            name="receivingCourse"
            defaultValue={jobData?.receivingCourse?.id || -1}
          />

          <CheckboxInput
            label="Select Deparments"
            options={deptOptions}
            name="receivingDepartments"
            defaultValues={jobData?.receivingDepartments?.map(
              (item) => item.id
            )}
            emptyMsg="Select a course!"
          />

          <SelectInput
            label="Select Batch"
            options={batchOptions}
            id="createJobBatch"
            name="receivingBatch"
            emptyMessage="No batches found for this course!"
            defaultValue={jobData?.receivingBatch?.id}
          />

          <FormInput
            label="Location"
            name="location"
            type="text"
            size="w-fit"
            defaultValue={jobData?.location}
          />

          <NumberInput
            label="Package (LPA)"
            name="jobPackage"
            minValue={1}
            size="w-fit"
            defaultValue={jobData?.jobPackage}
          />

          <NumberInput
            label="Openings Count"
            name="openingsCount"
            minValue={1}
            size="w-fit"
            defaultValue={jobData?.openingsCount}
          />

          <MultipleInputs
            label="Key Skills"
            name="keySkills"
            type="text"
            defaultValue={skillFields}
            manageFields={setSkillFields}
          />

          <DateInput
            label="Deadline"
            name="deadline"
            minDate={formatDate(new Date())}
            defaultValue={defaultDeadline}
            size="w-fit"
          />

          <div id="jobCreateFormError" className="text-red-500"></div>

          <button
            type="submit"
            className="btn btn-success self-center capitalize text-white btn-sm h-9 px-4"
            name="intent"
            value={`${jobData.action}Job`}
          >
            {jobData?.action}
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
export default CreateJobForm;
