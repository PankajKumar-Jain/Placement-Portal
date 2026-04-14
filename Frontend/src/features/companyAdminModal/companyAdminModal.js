import { createSlice } from '@reduxjs/toolkit';

const modalData = { action: 'add' };

const jobSlice = createSlice({
  name: 'companyAdminModal',
  initialState: modalData,
  reducers: {
    setModalData: (state, action) => {
      state.action = 'update';
      state.companyId = action.payload.companyId;
      state.companyName = action.payload.companyName;
      state.admin = action.payload.admin;
    },
    resetModalData: (state, action) => {
      state.action = 'add';
      state.companyId = action.payload.companyId;
      state.companyName = action.payload.companyName;
      delete state.admin;
    },
  },
});

export const { setModalData, resetModalData } = jobSlice.actions;

export default jobSlice.reducer;
