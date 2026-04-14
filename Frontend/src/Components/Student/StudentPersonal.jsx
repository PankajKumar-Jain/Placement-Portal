import { useLoaderData, Form, useSubmit } from 'react-router-dom';
import { SimpleFormInput, FileInput } from '../';

const StudentPersonal = () => {
  const personalDetails = useLoaderData().profileDetails?.personalDetails;
  const submit = useSubmit();

  let fatherName, motherName, contactNumber, address, dateOfBirth;

  if (personalDetails) {
    fatherName = personalDetails.fatherName;
    motherName = personalDetails.motherName;
    contactNumber = personalDetails.contactNumber;
    address = personalDetails.address;
    dateOfBirth = personalDetails.dateOfBirth
      ? new Date(personalDetails.dateOfBirth).toISOString().split('T')[0]
      : '';
  }

  const handlePhotoSelect = (event) => {
    if (!event.target.files?.length) return;

    const form = event.currentTarget.form;
    if (!form) return;

    const formData = new FormData(form);
    formData.set('intent', 'updatePersonalDetails');
    submit(formData, { method: 'post' });
  };

  return (
    <>
      <input
        type="radio"
        name="details"
        role="tab"
        className="tab capitalize sm:text-lg text-blue-500"
        aria-label="personal"
        defaultChecked={true}
      />

      <div role="tabpanel" className="mt-4 tab-content">
        <h3 className="text-2xl font-medium mb-4">Personal Details</h3>
        <Form method="POST" encType="multipart/form-data" className="flex flex-col gap-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 items-end">
            <FileInput
              name="photo"
              label="Profile Photo"
              onChange={handlePhotoSelect}
            />
            <SimpleFormInput
              name="fatherName"
              type="text"
              label="Father's Name"
              defaultValue={fatherName}
            />
            <SimpleFormInput
              name="motherName"
              type="text"
              label="Mother's Name"
              defaultValue={motherName}
            />
            <SimpleFormInput
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              defaultValue={dateOfBirth}
            />
            <SimpleFormInput
              name="locality"
              type="text"
              label="Locality"
              defaultValue={address?.locality}
            />
            <SimpleFormInput
              name="city"
              type="text"
              label="City"
              defaultValue={address?.city}
            />
            <SimpleFormInput
              name="pincode"
              type="text"
              label="Pin Code"
              defaultValue={address?.pincode}
            />
            <SimpleFormInput
              name="district"
              type="text"
              label="District"
              defaultValue={address?.district}
            />
            <SimpleFormInput
              name="state"
              type="text"
              label="State"
              defaultValue={address?.state}
            />
            <SimpleFormInput
              name="contactNumber"
              type="text"
              label="Contact Number"
              defaultValue={contactNumber}
            />
            <SimpleFormInput
              name="activeBacklogs"
              type="number"
              label="Active Backlogs"
              min="0"
              defaultValue={personalDetails?.activeBacklogs ?? ''}
            />
            <SimpleFormInput
              name="completedBacklogs"
              type="number"
              label="Completed Backlogs"
              min="0"
              defaultValue={personalDetails?.completedBacklogs ?? ''}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success max-w-fit self-end text-white btn-sm h-9 px-4"
            name="intent"
            value="updatePersonalDetails"
          >
            Update
          </button>
        </Form>
      </div>
    </>
  );
};

export default StudentPersonal;
