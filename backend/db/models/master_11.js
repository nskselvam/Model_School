'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Master_11 = sequelize.define(
    'Master_11',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      district_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      block_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      edu_dist_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      udise_code: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      school_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      school_type: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      management: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      category: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      cate_type: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Emis_No: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Gender_Label: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      dob_emis: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      father_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      mother_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      class_studying_id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Disability_status: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Disability_Name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      community_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Medium: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Gdc_DOB: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Gdc_Gender: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Gdc_Medium: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      Cen_Code: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      com: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      sex: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pstm: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true
      },
      Student_Status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Zone_Jee: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Zone_Neet: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Zone_Name_Jee: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      Zone_Name_Neet: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      selcat: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      selcom: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      selsex: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      selpstm: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      selPost: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      selFlg: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: 'N'
      },
      distFlg: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: 'N'
      },
      statFlg: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: 'N'
      }
    },
    {
      tableName: 'master_11',
      timestamps: true,
      underscored: false
    }
  );

  return Master_11;
};
