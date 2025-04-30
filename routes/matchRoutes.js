const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getMatches } = require('../controllers/matchController');

router.get('/', protect, getMatches);

module.exports = router;