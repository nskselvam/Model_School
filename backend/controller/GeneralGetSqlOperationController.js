const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const regulationData = db.Regulation_Master;
const centerData = db.Icm_Name_master;
const getRegulationData = asyncHandler(async (req, res) => {
  try {
    const data = await regulationData.findAll();
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching regulation data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getCenterData = asyncHandler(async (req, res) => {
  try {
    const data = await centerData.findAll();
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching center data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  getRegulationData,
  getCenterData,
};