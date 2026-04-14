import { createSlice } from '@reduxjs/toolkit';

const modalData = { action: 'add' };

const jobSlice = createSlice({
  name: 'companyModal',
  initialState: modalData,
  reducers: {
    setModalData: (state, action) => {
      state.action = 'update';
      state.company = action.payload.company;
    },
    resetModalData: (state) => {
      state.action = 'add';
      delete state.company;
    },
  },
});

export const { setModalData, resetModalData } = jobSlice.actions;

export default jobSlice.reducer;
