import { Action, configureStore } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { updateSiteConfig } from "./thunks/site.ts";
import siteConfigSliceReducer from "./siteConfigSlice";
import globalStateSliceReducer from "./globalStateSlice";
import fileManagerSliceReducer from "./fileManagerSlice.ts";
import chatStateSliceReducer from "./chatSlice.ts";

export const store = configureStore({
  reducer: {
    siteConfig: siteConfigSliceReducer,
    globalState: globalStateSliceReducer,
    fileManager: fileManagerSliceReducer,
    chatState: chatStateSliceReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

store.dispatch(updateSiteConfig());

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
