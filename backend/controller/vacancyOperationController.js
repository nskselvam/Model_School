const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const District_master = db.District_Master;
const Vacancy_master = db.Vacancy_Master;

const getDistrictMasterData = asyncHandler(async (req, res) => {
    const districtData = await District_master.findAll();
    res.json(districtData);
});

const getVacancyData = asyncHandler(async (req, res) => {
    const { dcode } = req.params;

    if(dcode != 'ALL') {
        const vacancyData = await Vacancy_master.findAll({
            where: { dCode: dcode }
        });
        res.json(vacancyData);
    } else {
        const vacancyData = await Vacancy_master.findAll();
        res.json(vacancyData);
    }
    
});

module.exports = {
    getDistrictMasterData,
    getVacancyData
}
 
