import { createSlice } from '@reduxjs/toolkit';

const courseOptions = {};

const courseOptionsSlice = createSlice({
  name: 'courses',
  initialState: courseOptions,
  reducers: {
    setCourseOptions: (state, action) => {
      const options = action.payload.options;
      for (let option of options) {
        state[option.courseId] = option;
      }
    },
  },
});

export const { setCourseOptions } = courseOptionsSlice.actions;

export default courseOptionsSlice.reducer;
