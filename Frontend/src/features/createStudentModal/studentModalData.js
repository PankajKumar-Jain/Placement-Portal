import { createSlice } from '@reduxjs/toolkit';

const modalData = { action: 'add' };

const jobSlice = createSlice({
  name: 'studentModal',
  initialState: modalData,
  reducers: {
    setModalData: (state, action) => {
      state.action = 'update';
      state.student = action.payload.student;
    },
    resetModalData: (state) => {
      state.action = 'add';
      delete state.student;
    },
  },
});

export const { setModalData, resetModalData } = jobSlice.actions;

export default jobSlice.reducer;
