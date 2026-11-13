import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  example: "",
  unreadNotificationCount: 0,
};

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {
    setExample: (state, action) => {
      state.example = action.payload;
    },
    setUnreadNotificationCount: (state, action) => {
      state.unreadNotificationCount = action.payload;
    },
    incrementUnreadNotificationCount: (state) => {
      state.unreadNotificationCount += 1;
    },
    decrementUnreadNotificationCount: (state) => {
      if (state.unreadNotificationCount > 0) {
        state.unreadNotificationCount -= 1;
      }
    },
    resetUnreadNotificationCount: (state) => {
      state.unreadNotificationCount = 0;
    },
  },
});

export const {
  setExample,
  setUnreadNotificationCount,
  incrementUnreadNotificationCount,
  decrementUnreadNotificationCount,
  resetUnreadNotificationCount,
} = commonSlice.actions;

export default commonSlice.reducer;
