const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const User_Log = db.User_Logs;
const User_Details = db.User_Details;
//const sub_master = db.sub_master;
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendmail");
const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../utils/jwtToken");
const redisClient = require("../config/redis");
const {
  formatToIST,
  getCurrentISTDateTime,
  getClientIP,
} = require("../utils/formatDateTime");

const registerUser = asyncHandler(async (req, res) => {
  const { candidateName, Email_Id, Role } = req.body;
  if (!candidateName || !Email_Id || !Role) {
    res.status(400);
    throw new AppError("Please provide candidateName, Email_Id and Role", 400);
  }

  const existingUser = await User_Details.findOne({
    where: { Email_Id: Email_Id.trim() },
  });
  if (existingUser) {
    res.status(400);
    throw new AppError("User already exists with this Email_Id", 400);
  }

  const generatePasword = Math.random()
    .toString(36)
    .slice(-8)
    .toString()
    .toUpperCase();

  await User_Details.create({
    candidateName: candidateName.trim(),
    Email_Id: Email_Id.trim(),
    Role: Role.toString(),
    User_Pass: await bcrypt.hash(generatePasword, bcrypt.genSaltSync(10)),
    Temp_Password: generatePasword,
    ResetPass: 'N',
    Login_Status: 'N',
    Mailer: 'N',
    token_version: 0,
  });

  res.status(201).json({ message: "User registered successfully", user: Role });
});

const loginUser = asyncHandler(async (req, res) => {
  const clientIP = getClientIP(req);
  const { email: username, password } = req.body;

  // Trim username and password to avoid whitespace issues
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new AppError("Username and password are required", 401);
  }

  const user_exists = await User_Details.findOne({
    where: { Email_Id: trimmedUsername },
  });

  if (!user_exists) {
    throw new AppError("Invalid credentials", 401);
  }
  
  // Use Temp_Password if ResetPass='N' (needs reset), otherwise use User_Pass
  const needsReset = user_exists.ResetPass === 'N';
  const passwordToCheck = needsReset ? user_exists.Temp_Password : user_exists.User_Pass;
  
  let isPasswordValid;
  
  if (needsReset) {
    // Temp_Password is stored as plain text - direct comparison
    isPasswordValid = trimmedPassword === passwordToCheck;
  } else {
    // User_Pass is hashed - use bcrypt
    isPasswordValid = await bcrypt.compare(trimmedPassword, passwordToCheck);
  }

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user_exists.ResetPass == "N") {
    res.status(200).json({
      message: "Please Reset Your Pasword ",
      user_status: 0,
      id: user_exists.id,
      Examiner_id: user_exists.Email_Id,
      Dep_Name: user_exists.DCODE,
      candidateName: user_exists.candidateName,
    });
    return;
  }

  user_exists.token_version = user_exists.token_version + 1;
  user_exists.Login_Status = 'Y';
  await user_exists.save();
  const token = generateToken(
    res,
    user_exists.id,
    user_exists.token_version,
    user_exists.Email_Id,
  );

  // Store key user fields in Redis for fast lookup
  if (redisClient.isConnected()) {
    try {
      const redisKey = `user:${user_exists.Email_Id}`;
      const redisData = {
        id: String(user_exists.id),
        Email_Id: String(user_exists.Email_Id),
        ...(user_exists.DCODE !== undefined && user_exists.DCODE !== null && { DCODE: String(user_exists.DCODE) }),
        ...(user_exists.SUB_CEN !== undefined && user_exists.SUB_CEN !== null && { SUB_CEN: String(user_exists.SUB_CEN) }),
        token_version: String(user_exists.token_version),
        userRole: String(user_exists.Role),
        updatedAt: new Date().toISOString(),
      };
      await redisClient.hSet(redisKey, redisData);
      await redisClient.expire(redisKey, 14400); // 4 hours
    } catch (redisErr) {
      console.warn('⚠ Could not store session in Redis:', redisErr.message);
      // Non-fatal — continue with login
    }
  }

  req.session.userid = {
    id: user_exists.id,
    user_Type: user_exists.Email_Id,
    Candidate_Name: user_exists.candidateName,
    Candidate_TestCode: user_exists.DCODE,
    AdminStatus: user_exists.Role,
    User_Ip: clientIP,
  };
  req.session.save();

  const User_Log_Update = await User_Log.create({
    User_Name: user_exists.Email_Id,
    User_Acticity: "Login",
    User_Ip: clientIP,
  });

  if (user_exists.Role == "2") {
    res.status(200).json({
      message: "Student logged in successfully",
      user_status: 1,
      user_Success: true,
      id: user_exists.id,
      username: user_exists.Email_Id,
      name: user_exists.candidateName,
      dcode: user_exists.DCODE,
      role: user_exists.Role,
      regulation_status: user_exists.Reg_Status,
      regulation: user_exists.Regulation,
    });
  } else if (user_exists.Role == "1") {
    res.status(200).json({
      message: "District Admin logged in successfully",
      user_status: 1,
      user_Success: true,
      username: user_exists.Email_Id,
      name: user_exists.candidateName,
      dcode: user_exists.DCODE,
      role: user_exists.Role,

    });
  } else if (user_exists.Role == "3") {
    res.status(200).json({
      message: "Zone Admin logged in successfully",
      user_status: 1,
      user_Success: true,
      username: user_exists.Email_Id,
      name: user_exists.candidateName,
      dcode: user_exists.DCODE,
      role: user_exists.Role,

    });
  }
  else{
    res.status(200).json({
      message: "State Admin logged in successfully",
      user_status: 1,
      user_Success: true,
      username: user_exists.Email_Id,
      name: user_exists.candidateName,
      role: user_exists.Role,
    });
  }
});

const password_reset = asyncHandler(async (req, res, next) => {
  const {
    email: username,
    password,
    confirmPassword,
    passwordStatus,
  } = req.body;
  if (!username || !password || !confirmPassword) {
    return next(new AppError("Please provide email and Password", 401));
  }

  if (password !== confirmPassword) {
    return next(
      new AppError("Password and Confirm Password do not match", 401),
    );
  }

  // Find user with ResetPass needing reset ('N')
  const result = await User_Details.findOne({
    where: { 
      Email_Id: username,
      ResetPass: 'N'
    },
  });
  
  if (!result) {
    return next(new AppError("Incorrect email or invalid password status", 401));
  }
  
  result.User_Pass = bcrypt.hashSync(password, 10);
  result.ResetPass = 'Y';
  const result_updated = await result.save();
  
  res.status(200).json({
    Message: "Password Reset Successfully",
    Candidate_Name: result_updated.candidateName,
    success: true
  });
});

const logout = asyncHandler(async (req, res) => {
  const clientIP = getClientIP(req);
  const token = req.cookies.jwt;

  try {
    const TokenValue = verifyToken(token);
    const userId = TokenValue.userId;

    // Get user info and update Login_Status
    const user = await User_Details.findByPk(userId);
    if (user) {
      // Set Login_Status to 'N' on logout
      user.Login_Status = 'N';
      await user.save();
      // Clear Redis data for this user
      if (redisClient.isConnected()) {
        const redisKey = `user:${user.Email_Id}`;
        try {
          await redisClient.del(redisKey);
        } catch (redisError) {
          console.error("Error clearing Redis data on logout:", redisError);
          // Continue with logout even if Redis cleanup fails
        }
      }
    }
  } catch (err) {
    console.error("Error during logout token verification:", err);
    // Continue with logout even if token is invalid
  }

  if (req.session.userid) {
    try {
      await User_Log.create({
        User_Name: req.session.userid.user_Type,
        User_Acticity: "Logout",
        User_Ip: clientIP,
      });
    } catch (logErr) {
      console.error("Error creating logout log entry:", logErr);
    }
  }

  req.session.destroy();
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const passsent_email = asyncHandler(async (req, res, next) => {
  const clientIP = getClientIP(req);
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 401));
  }
  const result = await User_Details.findOne({ where: { Email_Id: email } });
  if (!result) {
    return next(new AppError("Incorrect email", 401));
  }

  const Candidate_email = result.Email_Id;
  if (!Candidate_email) {
    return next(new AppError("Email ID not found for the user", 401));
  }

  const User_Log_Update = await User_Log.create({
    User_Name: Candidate_email,
    User_Acticity: "Password Reset",
    User_Ip: clientIP,
  });

  const generatePasword = Math.random()
    .toString(36)
    .slice(-8)
    .toString()
    .toUpperCase();

  result.Temp_Password = generatePasword;
  result.User_Pass = bcrypt.hashSync(generatePasword, 10);
  result.ResetPass = "N";
  await result.save();
  const subject = "Password Reset";
  const emailBody = `
        <h1>Password Reset</h1>
        <p>Dear ${result.candidateName},</p>
        <p>Your temporary password is: <strong>${generatePasword}</strong></p>
        <p>Please log in and change your password immediately.</p>
  `;
  try {
    await sendEmail(Candidate_email, subject, emailBody);
    return res.status(200).json({
      Message: "Password sent to your email " + Candidate_email,
    });
  } catch (error) {
    return next(new AppError("Email not sent", 401));
  }
});

module.exports = {
  registerUser,
  loginUser,
  password_reset,
  passsent_email,
  logout,
};
