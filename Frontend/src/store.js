import { configureStore } from '@reduxjs/toolkit';

import jobsSlice from './features/jobs/jobsSlice';
import userSlice from './features/user/userSlice';
import courseOptionsSlice from './features/courseOptions/courseOptions';
import studentProfileSlice from './features/studentProfile/studentProfileSlice';
import jobCreateSlice from './features/jobCreateForm/jobCreateSlice';
import createStudentSlice from './features/createStudentModal/studentModalData';
import courseModalSlice from './features/courseModal/courseModal';
import companyModalSlice from './features/companyModal/companyModal';
import companyAdminModalSlice from './features/companyAdminModal/companyAdminModal';

export const store = configureStore({
  reducer: {
    userState: userSlice,
    jobState: jobsSlice,
    courseOptions: courseOptionsSlice,
    studentProfileState: studentProfileSlice,
    jobCreateFormState: jobCreateSlice,
    createStudentState: createStudentSlice,
    courseModalState: courseModalSlice,
    companyModalState: companyModalSlice,
    companyAdminModalState: companyAdminModalSlice,
  },
});
