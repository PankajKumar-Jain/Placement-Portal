import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

initialState.user = JSON.parse(localStorage.getItem('user')) || null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
