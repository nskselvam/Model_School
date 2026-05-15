import { createSlice } from "@reduxjs/toolkit";

// Safe localStorage parser — prevents app crash on malformed / tampered JSON
const safeParseLocalStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined" || raw === "null") {
      localStorage.removeItem(key);
      return null;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key); // purge corrupted entry
    return null;
  }
};

const initialState = {
  userInfo: safeParseLocalStorage("userInfo"),
  regulationInfo: safeParseLocalStorage("regulationInfo"),
};

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        loginSuccess: (state, action) => {
            state.userInfo = action.payload
            localStorage.setItem('userInfo', JSON.stringify(action.payload)) 
        },
        setRegulationInfo: (state, action) => {
            state.regulationInfo = action.payload
            localStorage.setItem('regulationInfo', JSON.stringify(action.payload)) 
        },
        logoutSuccess: (state) => {
            state.userInfo = null
            state.regulationInfo = null
            localStorage.removeItem('userInfo')
            localStorage.removeItem('regulationInfo')
        },
        checkAuth: (state) => {
            state.isAuthenticated = !!localStorage.getItem('token');
        }
    },
});


export const {loginSuccess,logoutSuccess,checkAuth,setRegulationInfo} = authSlice.actions;
export default authSlice.reducer
