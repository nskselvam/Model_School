const router = require('express').Router();
const { getUserDetailsInsert, upDataMasterDataController, getUserDetailsOriginal,generateRank ,vacancyAllot} = require('../controller/upDataMasterDataController');
const { protect } = require('../middleware/authMiddleware');

router.get('/masterdata', upDataMasterDataController);
router.get('/user-details-original', getUserDetailsOriginal);
router.get('/user-details-insert', getUserDetailsInsert);
router.get('/generateRank', generateRank);
router.get('/vacancyAllot', vacancyAllot);

module.exports = router;