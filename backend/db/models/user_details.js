'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User_Details = sequelize.define(
    'User_Details',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      DCODE: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      SUB_CEN: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      Email_Id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      DNAME: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      DIST_NAME: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Role: {
        type: DataTypes.STRING(1),
        allowNull: true
      },
      Role_Active: {
        type: DataTypes.STRING(1),
        allowNull: true
      },
      Regulation: {
        type: DataTypes.STRING(4),
        allowNull: true
      },
      User_Pass: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Temp_Password: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      ResetPass: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      Checking: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      OutTime: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      Mailer: {
        type: DataTypes.STRING(1),
        allowNull: true
      },
      Rollno: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      Login_Status: {
        type: DataTypes.STRING(1),
        allowNull: true
      },
      Reg_Status: {
        type: DataTypes.STRING(1),
        allowNull: true
      },
      token_version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      candidateName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      User_Roll_Admin_0: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      User_Roll_Admin_1: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      User_Roll_Admin_2: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },
      User_Roll_Admin_3: {
        type: DataTypes.STRING(1000),
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
    {
      freezeTableName: true,
      modelName: 'User_Details',
      tableName: 'user_details'
    }
  );

  User_Details.associate = function (models) {
    // Define associations here if needed
  };

  return User_Details;
};
