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
  try {
    const userDetails = await db.sequelize.query(
      'SELECT * FROM "Master_11_clone"',
      {
        type: Sequelize.QueryTypes.SELECT,
        raw: true
      }
    );

    for (const record of userDetails) {
      await db.Master_11.create({
        district_name: record.district_name,
        block_name: record.block_name,
        edu_dist_name: record.edu_dist_name,
        udise_code: record.udise_code,
        school_name: record.school_name,
        school_type: record.school_type,
        management: record.management,
        category: record.category,
        cate_type: record.cate_type,
        Emis_No: record.Emis_No,
        name: record.name,
        Gender_Label: record.Gender_Label,
        dob_emis: record.dob_emis,
        father_name: record.father_name,
        mother_name: record.mother_name,
        class_studying_id: record.class_studying_id,
        Disability_status: record.Disability_status,
        Disability_Name: record.Disability_Name,
        community_name: record.community_name,
        Medium: record.Medium,
        Gdc_DOB: record.Gdc_DOB,
        Gdc_Gender: record.Gdc_Gender,
        Gdc_Medium: record.Gdc_Medium,
        Cen_Code: record.Cen_Code,
        com: record.com,
        sex: record.sex,
        pstm: record.pstm,
        dob: record.dob,
        Student_Status: record.Student_Status,
        Zone_Jee: record.Zone_Jee,
        Zone_Neet: record.Zone_Neet,
        Zone_Name_Jee: record.Zone_Name_Jee,
        Zone_Name_Neet: record.Zone_Name_Neet
      }); 
    }

    res.status(200).json({
      status: "success",
      message: "Data inserted successfully",
      count: userDetails.length
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = { upDataMasterDataController, getUserDetailsOriginal, getUserDetailsInsert };