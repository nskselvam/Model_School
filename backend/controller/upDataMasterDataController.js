const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { Sequelize, Op } = require("sequelize");


const upDataMasterDataController = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Master data endpoint"
  });
});

const getUserDetailsOriginal = asyncHandler(async (req, res) => {
  try {
    const results = await db.sequelize.query(
      'SELECT * FROM "New_Icm_Name"',
      {
        type: Sequelize.QueryTypes.SELECT,
        raw: true
      }
    );


    results.forEach(async record => {

      const DataUpdate = await db.Icm_Name_master.create(
        {
          DCODE: record.DCODE,
          DNAME: record.DNAME,
          dist_Name: record.dist_Name
        }
      );

    });

    res.status(200).json({
      status: "success",
      count: results?.length || 0,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

const getUserDetailsInsert = asyncHandler(async (req, res) => {


  const userDetails = await db.sequelize.query(
    'SELECT * FROM "user_role_master_clone"',
    {
      type: Sequelize.QueryTypes.SELECT,
      raw: true
    }
  );

  for (const record of userDetails) {
    await db.user_role_masters.create({
      user_role_code: record.user_role_code,
      user_role: record.user_role
    }); 
  }


  res.status(200).json({
    status: "success",
    message: "Data inserted successfully"
  });

});

module.exports = { upDataMasterDataController, getUserDetailsOriginal, getUserDetailsInsert };