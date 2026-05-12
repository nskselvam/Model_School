import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import LoginCard from '../../components/Login/LoginCard'
import { useLoginMutation, useLogoutMutation } from '../../redux-slice/authApiSlice'
import { loginSuccess, logoutSuccess } from "../../redux-slice/authSlice";
import '../../style/login.css'
import login from "../../hooks/login/login.json"
import { toast } from 'react-toastify'
//Login file import 



const Login = () => {

  //variable declaration
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  const [loginMutation, { isLoading }] = useLoginMutation()
  const [logoutMutation] = useLogoutMutation()
  const [error, setError] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // If user is already logged in and tries to access login page, log them out
  useEffect(() => {
    const handleAutoLogout = async () => {
      // Check if user is logged in from a previous session
      const storedUserInfo = localStorage.getItem('userInfo')
      
      if (storedUserInfo && !isLoggingOut) {
        setIsLoggingOut(true)
        try {
          // Call logout API with timeout
          const logoutPromise = logoutMutation().unwrap()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
          )
          
          await Promise.race([logoutPromise, timeoutPromise])
        } catch (err) {
          // Silently handle errors - user might already be logged out
          if (err?.name !== 'AbortError') {
            console.error('Logout error:', err)
          }
        } finally {
          // Clear local state regardless of API response
          dispatch(logoutSuccess())
          localStorage.clear()
          toast.info("You have been logged out. Please login again.")
          setIsLoggingOut(false)
        }
      }
    }
    
    // Only run once on component mount
    handleAutoLogout()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handle form submission
  const onSubmit = async ({ email, password, remember }) => {

    setError(null)
    try {
      const response = await loginMutation({ email, password }).unwrap();

      const userData = {
        ...response,
      }

      console.log("Login response:", userData);


      // user_status = 0: Password reset required (temporary password)
      if (userData.user_status == 0) {
        dispatch(loginSuccess({ ...userData }));
        toast.info(userData.message || "Please reset your password");
        navigate(`/reset-password`);
      }
      // ResetPass = N: First-time login with temporary password (N = not reset)
      else if (userData.ResetPass == 'N') {
        dispatch(loginSuccess({ ...userData }));
        toast.info(userData.message || "Please reset your temporary password");
        navigate(`/temporary-password`);
      }
      else if(userData.user_status == 1 && userData.user_Success && userData.role == '2'){
        dispatch(loginSuccess({ ...userData }));
        toast.success(userData.message || "Login successful");
        navigate('/candidate/dashboard');
      } else if(userData.user_status == 1 && userData.user_Success && userData.role == '1'){
        dispatch(loginSuccess({ ...userData }));
        toast.success(userData.message || "Login successful");
        navigate('/district/common/dashboard');
      } else if(userData.user_status == 1 && userData.user_Success && userData.role == '0'){
        dispatch(loginSuccess({ ...userData }));
        toast.success(userData.message || "Login successful");
        navigate('/state/common/dashboard');
      } else if(userData.user_status == 1 && userData.user_Success && userData.role == '3'){
        dispatch(loginSuccess({ ...userData }));
        toast.success(userData.message || "Login successful");
        navigate('/zone/common/dashboard');
      }
       else {
        toast.error("Invalid credentials");
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Login failed");
    }
  }


//return value
  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-left-section">
          <LoginCard onSubmit={onSubmit} isLoading={isLoading} error={error} />
        </div>
        
        {/* <div className="login-right-section">
          <div className="instructions-card">
            <h3 className="instructions-title">INSTRUCTIONS TO THE EVALUATORS</h3>
            <div className="instructions-content">
              <ul className="instructions-list">
                <li>To login - ID, and an OTP was already sent to your Registered Mobile number.</li>
                <li>You will be requested to Reset the Password.</li>
                <li>The Password should be with 8 digits, Alpha Numerical along with atleast one special character. (For Example- Exam@123).</li>
                <li>While entering Marks – Enter '0' for wrong answers and Enter 'NA' if Not Answered.</li>
                <li>Award Marks for all the attended questions irrespective of choices which will be done by the system.</li>
                <li>'Save' button will be enabled after you checked the last page of the answer booklet.</li>
                <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: 'red' }}>SPECIAL INSTRUCTIONS</p>
                <li>Maintain Silence in the evaluation hall.</li>
                <li>Logout properly before you leave or keeping the system idle.</li>
                <li>Do not use Mobile Phones in the evaluation hall.</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}


export default Login
