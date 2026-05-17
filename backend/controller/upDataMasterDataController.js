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
    'SELECT * FROM "Vacancy_11"',
    {
      type: Sequelize.QueryTypes.SELECT,
      raw: true
    }
  );

  for (const record of userDetails) {
    await db.Vacancy_Master.create({
      Vac_Status: record.Vac_Status,
      Catgegory: record.Catgegory,
      Vacancy: record.Vacancy,
      sex: record.sex,
      pstm: record.pstm,
      Student_Status: record.Student_Status,
      Com: record.Com,
      ph: record.ph,
      seq: record.seq,
      REM: record.REM,
      REM1: record.REM1,
      REM2: record.REM2,
      REM3: record.REM3,
      Vacancy_Type: record.Vacancy_Type,
      Center_Type: record.Center_Type,
      Zone_Code: record.Zone_Code,
      Zone_Name: record.Zone_Name,
      student_type: record.student_type,
      dCode: record.dCode,
      vacancyStd: record.vacancyStd
    }); 
  }


  res.status(200).json({
    status: "success",
    message: "Data inserted successfully"
  });

});

module.exports = { upDataMasterDataController, getUserDetailsOriginal, getUserDetailsInsert };