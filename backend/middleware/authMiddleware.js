const jwt = require("jsonwebtoken");
const db = require("../db/models");
const redisClient = require("../config/redis");
const user = db.User_Details;
const NavData = db.navbar_header;
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/appError");


const modalprotect = asyncHandler(async (req, res, next) => {

  let token;

  // Check for token in cookies first, then query params (for file downloads)
  token = req.cookies.jwt || req.query.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const tokendb = await user.findByPk(decoded.userId);
      if (!tokendb) {
        return next(new AppError("User not found", 401));
      }
      if (tokendb.token_version !== decoded.token_version) {
        return next(new AppError("User not found", 401));
      }

      req.user = tokendb;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new AppError(`Not authorised, token failed: ${error.message}`);
    }
  } else {
    res.status(401);
    throw new AppError("Not authorised, no token");
  }
});

const Redisprotect = asyncHandler(async (req, res, next) => {

  let token;

  // Check for token in cookies first, then query params (for file downloads)
  token = req.cookies.jwt || req.query.token;

  //console.log('Redisprotect middleware invoked. Token found:', token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded token in Redisprotect:', decoded);

      //const tokendb = await user.findByPk(decoded.userId);
      let tokendb = null;
      if (redisClient.isConnected()) {
        try {
          const redisKey = `user:${decoded.Email_Id}`;

          const redisUserData = await redisClient.hGetAll(redisKey);
          //  console.log('Redis data retrieved for key', redisKey, ':', redisUserData);

          if (redisUserData && Object.keys(redisUserData).length > 0) {
            tokendb = {
              Email_Id: decoded.Email_Id,
              user_Type: parseInt(redisUserData.userRole, 10) || decoded.user_Type,
              token_version: parseInt(redisUserData.token_version, 10) || decoded.token_version
            };
            console.log('Using Redis data for user:', redisUserData.token_version, 'Db token version:', decoded.token_version);
            if(tokendb.token_version !== decoded.token_version) {
              console.warn(`Token version mismatch for user ${decoded.Email_Id}. Redis: ${tokendb.token_version}, Token: ${decoded.token_version}`);
              return next(new AppError("User not found", 401));
            }
            //  tokendb = redisUserData.token_version !== decoded.token_version
          } else {
            tokendb = await user.findByPk(decoded.userId);
          }
        } catch (redisError) {
          console.error('Error retrieving Redis data:', redisError);
          tokendb = await user.findByPk(decoded.userId);
        }
      } else {
        tokendb = await user.findByPk(decoded.userId);
      }

      if (!tokendb) {
        return next(new AppError("User not found", 401));
      }
      if (tokendb.token_version !== decoded.token_version) {
        return next(new AppError("User not found", 401));
      }

      // Check if user has access to valuation routes


      req.user = tokendb;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new AppError(`Not authorised, token failed: ${error.message}`);
    }
  } else {
    res.status(401);
    throw new AppError("Not authorised, no token");
  }
});

const protect = asyncHandler(async (req, res, next) => {

  // Extract route path from custom header or referer
  let routePath = req.headers['x-current-route'] || req.headers['current-route'];

  if (!routePath) {
    const referer = req.headers.referer || req.headers.referrer;
    if (referer) {
      try {
        const url = new URL(referer);
        routePath = url.pathname.substring(1);
      } catch (error) {}
    }
  }

  req.routePath = routePath;

  const token = req.cookies.jwt || req.query.token;

  if (!token) {
    res.status(401);
    throw new AppError("Not authorised, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Step 1: Try Redis first ───────────────────────────────────────────────
    let redisUserData = null;
    let tokendb = null;

    if (redisClient.isConnected()) {
      try {
        const redisKey = `user:${decoded.Email_Id}`;
        redisUserData = await redisClient.hGetAll(redisKey);

        if (redisUserData && Object.keys(redisUserData).length > 0) {
          const redisTokenVersion = parseInt(redisUserData.token_version, 10);
          if (redisTokenVersion !== decoded.token_version) {
            return next(new AppError("User not found", 401));
          }
          // Valid Redis hit — build a minimal user object
          req.redisUserData = redisUserData;
          tokendb = {
            id: parseInt(redisUserData.id, 10),
            Email_Id: decoded.Email_Id,
            token_version: redisTokenVersion,
            Role: redisUserData.userRole || null,
          };
        }
      } catch (redisError) {
        console.error('Error retrieving Redis data:', redisError);
      }
    }

    // ── Step 2: Determine whether nav check is needed ────────────────────────
    const userRole = redisUserData?.userRole || req.query.userRole;
    const isApiRoute      = req.originalUrl.includes('/api/admin/') || req.baseUrl === '/api/admin';
    const isNavbarRoute   = req.baseUrl === '/api/navbar';
    const isDashboard     = ['admin/dashboard','examiner/valuation-review','state/dashboard','district/dashboard','common/dashboard','candidate/dashboard','state/common/dashboard','district/common/dashboard'].includes(routePath);
    const isAdminRoute    = routePath?.startsWith('admin/navbaradd') || routePath?.startsWith('admin/rollmaster') || routePath?.startsWith('admin/examinerrollupdate');
    const isUserProfileRoute = ['reset-password','change-password','profile','login'].includes(routePath);
    const isUserRole2Route = (routePath === 'valuation' || routePath === 'examiner/review' || routePath === 'examiner/reviewe/valuationreview') && userRole == 2;
    const isUserRole1Route = (routePath === 'valuation/chief-valuation-review' || routePath === 'valuation/chief-valuation-review-main' || routePath === 'valuation/chief-valuation') && userRole == 1;
    const generalBackup   = routePath === 'admin/data-backup' || routePath === 'admin/admin-window';
    const shouldSkipNavCheck = isApiRoute || isNavbarRoute || isDashboard || isAdminRoute || isUserProfileRoute || isUserRole2Route || isUserRole1Route || generalBackup;

    // ── Step 3: DB query only when Redis missed OR nav check needed ───────────
    if (!tokendb || !shouldSkipNavCheck) {
      const dbUser = await user.findByPk(decoded.userId);
      if (!dbUser) {
        return next(new AppError("User not found", 401));
      }
      if (dbUser.token_version !== decoded.token_version) {
        return next(new AppError("User not found", 401));
      }
      tokendb = dbUser;
    }

    // ── Step 4: Nav check (only when not skipped) ────────────────────────────
    if (!shouldSkipNavCheck) {
      const flnameRollMaster = "User_Roll_Admin_" + userRole;
      let UserRole = [];

      if (tokendb[flnameRollMaster]) {
        try {
          UserRole = tokendb[flnameRollMaster].startsWith('[')
            ? JSON.parse(tokendb[flnameRollMaster])
            : tokendb[flnameRollMaster].split(',').map(r => r.trim());
        } catch (e) {
          console.error(`Error parsing ${flnameRollMaster}:`, e);
        }
      }

      const UserRoleIds = UserRole.map(r => parseInt(r, 10)).filter(id => !isNaN(id) && id > 0);

      if (UserRoleIds.length === 0) {
        return next(new AppError("No navigation permissions assigned for this role", 403));
      }

      const data = await NavData.findAll({
        where: { id: UserRoleIds, route_path: `/${routePath}` },
        attributes: ['id'],
        limit: 1,
      });

      if (data.length === 0) {
        return next(new AppError("No navigation data found for user role", 404));
      }
    }

    req.user = tokendb;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401);
    throw new AppError(`Not authorised, token failed: ${error.message}`);
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.user_Type == 1) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised as Admin");
  }
});

const candidateprotect = (req, res, next) => {
  if (req.user && req.user.user_Type == 3) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised as Candidate");
  }
};

module.exports = { protect, admin, candidateprotect, modalprotect, Redisprotect };
