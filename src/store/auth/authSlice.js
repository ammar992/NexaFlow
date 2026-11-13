import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  refreshToken: "",
  user: null,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    saveLoginUserData(state, action) {
      state.user = action?.payload?.user;
      state.accessToken = action?.payload?.token;
      state.refreshToken = action?.payload?.refreshToken;
    },

    updateUser(state, action) {
      state.user = action.payload;
    },
    signOutRequest(state) {
      state.accessToken = "";
      state.refreshToken = "";
      state.user = null;
    },
    updateJWTTokens: (state, action) => {
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

export const {
  saveLoginUserData,
  signOutRequest,
  updateUser,
  updateJWTTokens,
} = authSlice.actions;

export default authSlice.reducer;
