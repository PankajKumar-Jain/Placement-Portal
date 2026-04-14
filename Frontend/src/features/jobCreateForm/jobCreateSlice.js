import { createSlice } from '@reduxjs/toolkit';

const jobModalData = { action: 'create', keySkills: [''] };

const jobCreateFormSlice = createSlice({
  name: 'jobCreateForm',
  initialState: jobModalData,
  reducers: {
    setJobModalData: (state, action) => {
      for (let key in action.payload) {
        state[key] = action.payload[key];
      }
      state.action = 'update';
    },

    resetJobModalData: (state) => {
      for (let key in state) {
        delete state[key];
      }
      state.action = 'create';
      state.keySkills = [''];
    },
  },
});

export const { setJobModalData, resetJobModalData } =
  jobCreateFormSlice.actions;

export default jobCreateFormSlice.reducer;
