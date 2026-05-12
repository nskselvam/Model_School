const router = require("express").Router();
const {getRegulationData,getCenterData} = require("../controller/GeneralGetSqlOperationController");
const { protect, admin } = require("../middleware/authMiddleware");
router.route("/regulation-data").get( getRegulationData);
router.route("/center-data").get( getCenterData);
module.exports = router;