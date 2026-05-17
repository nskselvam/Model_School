const router = require("express").Router();
const {
  getDistrictMasterData,
  getVacancyData,
} = require("../controller/vacancyOperationController");
const { modalprotect } = require("../middleware/authMiddleware");

router.get("/get_district_master_data", modalprotect, getDistrictMasterData);
router.get("/get_vacancy_data/:dcode", modalprotect, getVacancyData);

module.exports = router;