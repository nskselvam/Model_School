import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux-slice/authSlice";
import errDataInfoReducer from "../redux-slice/errResponseSlice";
import { apiSlice } from "../redux-slice/apiSlice";
import navbarReducer from '../redux-slice/navbarSlice'

const  { VITE_NODE_ENV } = import.meta.env;

const store = configureStore({
  reducer: {
    auth: authReducer,
    errinfo: errDataInfoReducer,
    navbarBar: navbarReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query actions that may contain non-serializable data (blobs, promises, etc)
        ignoredActions: [
          'api/executeQuery/fulfilled', 
          'api/executeQuery/pending',
          'api/executeQuery/rejected',
          // Ignore all RTK Query internal actions
          /^api\/.*\/(pending|fulfilled|rejected)$/,
        ],
        // Ignore the entire api.queries state path which may contain cached blobs and meta info
        ignoredPaths: ['api.queries', 'api.mutations', 'api.subscriptions', 'api.config'],
      },
    }).concat(apiSlice.middleware),
  // Enable Redux DevTools only in development
  devTools: VITE_NODE_ENV !== "production",
 //  devTools:false,
});

export default store;
