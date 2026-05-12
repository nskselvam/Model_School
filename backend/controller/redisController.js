const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const redisClient = require("../config/redis");


const updateRoleDegree = asyncHandler(async (req, res) => {
  const { Eva_Id } = req.body;
  
  // Validate required fields
  if (!Eva_Id) {
    console.error('ERROR: Eva_Id is missing from request');
    return res.status(400).json({ message: "Eva_Id is required" });
  }

  // Check if Redis is available
  if (!redisClient.isConnected()) {
    console.warn('⚠ WARNING: Redis not available. Data not cached.');
    return res.status(200).json({ 
      message: "Request received but Redis caching unavailable",
      warning: "Redis server is not running",
      data: { Eva_Id }
    });
  }

  const dbUser = await db.User_Details.findOne({ where: { 
    Email_Id: Eva_Id } 
  });
  if (!dbUser) {
    console.error(`ERROR: User with Eva_Id ${Eva_Id} not found in database`);
    return res.status(404).json({ message: "User not found" });
  }

 

  try {
    // Create a unique key for this user
    const redisKey = `user:${Eva_Id}`;
    
    // Prepare data object
    const userData = {
      Eva_Id,
      ...(dbUser.token_version !== undefined && { token_version: String(dbUser.token_version) }),
      ...(dbUser.id !== undefined && { id: String(dbUser.id) }),
      ...(dbUser.Email_Id !== undefined && { Email_Id: String(dbUser.Email_Id) }),
      ...(dbUser.DCODE !== undefined && dbUser.DCODE !== null && { DCODE: String(dbUser.DCODE) }),
      ...(dbUser.SUB_CEN !== undefined && dbUser.SUB_CEN !== null && { SUB_CEN: String(dbUser.SUB_CEN) }),
      ...(dbUser.Role !== undefined && { userRole: String(dbUser.Role) }),
      updatedAt: new Date().toISOString()
    };


    console.log('Storing in Redis:', userData);
    // Store in Redis as a hash (this will overwrite existing values)
    const result = await redisClient.hSet(redisKey, userData);
    
    // Verify it was stored
    const verification = await redisClient.hGetAll(redisKey);
    
    // Set expiration to 4 hours (14400 seconds)
    await redisClient.expire(redisKey, 14400);
    
    
    res.status(200).json({ 
      message: "User role and degree updated successfully in Redis",
      data: userData
    });
  } catch (error) {
    console.error('❌ Redis error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: "Failed to update user data in Redis",
      error: error.message 
    });
  }
});

module.exports = {
  updateRoleDegree
};