import { Form } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { CheckboxInput, FormInput, SelectInput } from '../';
import {
  getCourseOptions,
  getDepartmentOptions,
  getBatchOptions,
} from '../../utils';

const AddSingleStudent = () => {
  const courseOptions = useSelector((state) => state.courseOptions);
  const { action, student } = useSelector((state) => state.createStudentState);

  const courseId = action === 'add' ? -1 : student?.courseId;
  const [deptOptions, setDeptOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

  useEffect(() => {
    if (courseId !== -1) {
      const deptOptions = getDepartmentOptions(
        courseOptions[courseId].departments
      );
      setDeptOptions(deptOptions);

      const batchOptions = getBatchOptions(courseOptions[courseId].batches);
      setBatchOptions(batchOptions);
    } else {
      setDeptOptions([]);
      setBatchOptions([]);
    }
  }, [action, student?._id, courseId]);

  return (
    <dialog id="addSingleStudentModal" className="modal">
      <div className="modal-box pb-0">
        <h3 className="font-bold text-lg underline capitalize">
          {action} Student
        </h3>
        <Form
          method="POST"
          className="mt-2 flex flex-col gap-4"
          name="addSingleStudentForm"
        >
          {action === 'update' && (
            <input
              type="text"
              name="studentId"
              defaultValue={student?._id}
              hidden
            />
          )}
          <FormInput
            label="Name"
            name="name"
            type="text"
            defaultValue={student?.name}
            labelColor='text-base-300'
          />

          {action === 'add' && (
            <>
              <FormInput label="Email" name="email" type="email" labelColor='text-base-300' />

              <FormInput label="Password" name="password" type="password"  labelColor='text-base-300'/>

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                labelColor='text-base-300'
              />
            </>
          )}

          <FormInput
            label="Roll No"
            name="rollNo"
            type="text"
            labelColor='text-base-300'
            defaultValue={student?.rollNo}
          />

          <CheckboxInput
            label="Lateral Entry"
            name="isLateralEntry"
            options={[{ text: 'Yes', value: 'yes' }]}
            defaultValues={student?.isLateralEntry ? ['yes'] : []}
          />

          <SelectInput
            label="Select Course"
            options={getCourseOptions(courseOptions)}
            id="createStudentCourse"
            changeFn={handleCourseChange}
            name="courseId"
            defaultValue={courseId}
          />

          <SelectInput
            label="Select Deparments"
            options={deptOptions}
            name="departmentId"
            emptyMessage="Select a course!"
            defaultValue={student?.departmentId}
          />

          <SelectInput
            label="Select Batch"
            options={batchOptions}
            name="batchId"
            emptyMessage="No batches found for this course!"
            defaultValue={student?.batchId}
          />

          <div id="addSingleStudentFormError" className="text-red-500"></div>
          <button
            type="submit"
            className="btn btn-success text-white capitalize self-center btn-sm h-9 px-4"
            name="intent"
            value={`${action}SingleStudent`}
          >
            {action}
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

  async function handleCourseChange() {
    const courseId = document.getElementById('createStudentCourse').value;

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
};
export default AddSingleStudent;
