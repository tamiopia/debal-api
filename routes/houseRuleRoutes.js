const express = require('express');
const router = express.Router();
const {
    createHouseRule,
    getAllHouseRules,
    getHouseRule,
    updateHouseRule,
    deleteHouseRule
} = require('../controllers/houseRuleController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected (require authentication)
router.use(protect);

router.route('/')
    .post(createHouseRule)  // provider comes from request body
    .get(getAllHouseRules); // optionally filter by provider query param

router.route('/:id')
    .get(getHouseRule)
    .put(updateHouseRule)   // provider comes from request body
    .delete(deleteHouseRule);

module.exports = router;