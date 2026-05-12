const router = require('express').Router();
const { upDataMasterDataController, getUserDetailsOriginal } = require('../controller/upDataMasterDataController');
const { protect } = require('../middleware/authMiddleware');

router.get('/masterdata', upDataMasterDataController);
router.get('/user-details-original', getUserDetailsOriginal);

module.exports = router;