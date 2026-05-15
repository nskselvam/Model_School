import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import LoginCard from '../../components/Login/LoginCard'
import { useLoginMutation, useLogoutMutation } from '../../redux-slice/authApiSlice'
import { loginSuccess, logoutSuccess } from "../../redux-slice/authSlice";
import '../../style/login.css'
import { toast } from 'react-toastify'

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute

// Maps role value to its dashboard route
const ROLE_ROUTES = {
  '0': '/state/common/dashboard',
  '1': '/district/common/dashboard',
  '2': '/candidate/dashboard',
  '3': '/zone/common/dashboard',
};

const Login = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loginMutation, { isLoading }] = useLoginMutation()
  const [logoutMutation] = useLogoutMutation()
  const [error, setError] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const loginAttemptsRef = useRef(0)
  const lockTimerRef = useRef(null)
  const [isLocked, setIsLocked] = useState(false)

  // If user is already logged in and tries to access login page, log them out
  useEffect(() => {
    const handleAutoLogout = async () => {
      const storedUserInfo = localStorage.getItem('userInfo')

      if (storedUserInfo && !isLoggingOut) {
        setIsLoggingOut(true)
        try {
          const logoutPromise = logoutMutation().unwrap()
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
          )
          await Promise.race([logoutPromise, timeoutPromise])
        } catch (err) {
          if (err?.name !== 'AbortError') {
            console.error('Logout error:', err)
          }
        } finally {
          dispatch(logoutSuccess())
          localStorage.clear()
          toast.info("You have been logged out. Please login again.")
          setIsLoggingOut(false)
        }
      }
    }

    handleAutoLogout()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear lock timer on unmount
  useEffect(() => () => { if (lockTimerRef.current) clearTimeout(lockTimerRef.current); }, []);

  // Handle form submission
  const onSubmit = async ({ email, password }) => {
    // Check brute-force lockout
    if (isLocked) {
      toast.error('Too many failed attempts. Please wait before retrying.');
      return;
    }

    setError(null)
    try {
      // Sanitize: trim whitespace, normalise email case
      const sanitizedEmail = email.trim().toLowerCase();
      const response = await loginMutation({ email: sanitizedEmail, password }).unwrap();

      const userData = { ...response };

      // Reset attempt counter on any successful API response
      loginAttemptsRef.current = 0;
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      setIsLocked(false);
      setError(null);

      // user_status = 0: Password reset required (temporary password)
      if (Number(userData.user_status) === 0) {
        dispatch(loginSuccess({ ...userData }));
        toast.info(userData.message || "Please reset your password");
        navigate('/reset-password');
      }
      // ResetPass = N: First-time login with temporary password
      else if (userData.ResetPass === 'N') {
        dispatch(loginSuccess({ ...userData }));
        toast.info(userData.message || "Please reset your temporary password");
        navigate('/temporary-password');
      }
      else if (Number(userData.user_status) === 1 && userData.user_Success) {
        const route = ROLE_ROUTES[String(userData.role)];
        if (route) {
          dispatch(loginSuccess({ ...userData }));
          toast.success(userData.message || "Login successful");
          navigate(route);
        } else {
          toast.error("Unauthorized role");
        }
      }
      else {
        toast.error("Invalid credentials");
      }
    } catch (err) {
      loginAttemptsRef.current += 1;
      if (loginAttemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
        setIsLocked(true);
        loginAttemptsRef.current = 0;
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => setIsLocked(false), LOCKOUT_DURATION_MS);
        toast.error(`Account temporarily locked after ${MAX_LOGIN_ATTEMPTS} failed attempts. Try again in 5 minutes.`);
      } else {
        const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttemptsRef.current;
        toast.error(
          (err?.data?.message || err.error || "Login failed") +
          ` (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining)`
        );
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-left-section">
          <LoginCard onSubmit={onSubmit} isLoading={isLoading} error={error} isLocked={isLocked} />
        </div>
      </div>
    </div>
  )
}


export default Login
