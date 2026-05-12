import { createSlice } from "@reduxjs/toolkit";

// Clear invalid localStorage data
if (localStorage.getItem("userInfo") === "undefined" || localStorage.getItem("userInfo") === "null") {
  localStorage.removeItem("userInfo");
}

if (localStorage.getItem("regulationInfo") === "undefined" || localStorage.getItem("regulationInfo") === "null") {
  localStorage.removeItem("regulationInfo");
}
 
const initialState = {
  userInfo: localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo"))  : null,
  regulationInfo: localStorage.getItem("regulationInfo") ? JSON.parse(localStorage.getItem("regulationInfo"))  : null
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
