const router = require("express").Router();

const {
  getDistrictMasterData,
} = require("../controller/masterOperatonController");
const { modalprotect } = require("../middleware/authMiddleware");

router.get("/get_district_master_data", getDistrictMasterData);


module.exports = router;