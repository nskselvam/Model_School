const router = require('express').Router();
const { getUserDetailsInsert, upDataMasterDataController, getUserDetailsOriginal } = require('../controller/upDataMasterDataController');
const { protect } = require('../middleware/authMiddleware');

router.get('/masterdata', upDataMasterDataController);
router.get('/user-details-original', getUserDetailsOriginal);
router.get('/user-details-insert', getUserDetailsInsert);

module.exports = router;