const router = require('express').Router();
const { getUserDetailsInsert, upDataMasterDataController, getUserDetailsOriginal,generateRank ,vacancyAllot} = require('../controller/upDataMasterDataController');
const { protect } = require('../middleware/authMiddleware');

router.get('/masterdata', protect,upDataMasterDataController);
router.get('/user-details-original',protect, getUserDetailsOriginal);
router.get('/user-details-insert', protect, getUserDetailsInsert);
router.get('/generateRank', protect, generateRank);
router.get('/vacancyAllot', protect, vacancyAllot);

module.exports = router;