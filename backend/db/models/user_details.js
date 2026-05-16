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
      D_Code: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      User_Id: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      User_Name: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      Password: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      Role: {
        type: DataTypes.STRING(15),
        allowNull: true
      },
      LoginDate: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      ResetPass: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      Temp_Password: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      Mobile_Number: {
        type: DataTypes.STRING(25),
        allowNull: true
      },
      Email_Id: {
        type: DataTypes.STRING(250),
        allowNull: true
      },
      Block: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      state_coord_dcode: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mailer: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      activestatus: {
        type: DataTypes.STRING(15),
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
