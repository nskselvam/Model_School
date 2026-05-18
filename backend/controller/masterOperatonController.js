const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { where } = require("sequelize");
const { formatDateOnly } = require("../utils/formatDateTime");



const getDistrictMasterData = asyncHandler(async (req, res) => {


    const masterData = await db.Master_11.findAll({
        where: { selFlg: 'Y' },
        attributes: ['Emis_No', 'udise_code', 'district_name', 'school_name','father_name', 'name', 'com', 'sex', 'pstm', 'dob', 'Zone_Name_Jee','Zone_Name_Neet','ph','Disability_Name']
    });

    // Format the DOB field to dd-mm-yyyy
    const formattedData = masterData.map(record => {
        const data = record.toJSON();
        if (data.dob) {
            data.dob = formatDateOnly(data.dob);
        }
        return data;
    });

    res.json({ message: "Master Data Operation Controller", data: formattedData });



});


module.exports = {
    getDistrictMasterData
}

