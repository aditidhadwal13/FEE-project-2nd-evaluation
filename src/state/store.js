import { configureStore } from "@reduxjs/toolkit";
import hospitalReducer from "./hospitalSlice";

export const store = configureStore({
  reducer: {
    hospital: hospitalReducer
  }
});

export default store;
