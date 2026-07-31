import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    token: null,
    user: null,
    loading: true,
  },

  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      
    },

   

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    logout: (state) => {
      state.token = '';
      state.user = null;
     localStorage.removeItem('token')
    },
  },
});

export const {
  login,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;