import { createSlice } from '@reduxjs/toolkit';

const modalData = { action: 'add' };

const jobSlice = createSlice({
  name: 'courseModal',
  initialState: modalData,
  reducers: {
    setModalData: (state, action) => {
      state.action = 'update';
      state.course = action.payload.course;
    },
    resetModalData: (state) => {
      state.action = 'add';
      delete state.course;
    },
  },
});

export const { setModalData, resetModalData } = jobSlice.actions;

export default jobSlice.reducer;
