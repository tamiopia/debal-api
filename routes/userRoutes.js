// routes/user.js or routes/filter.js
const express = require('express');
const router = express.Router();
const { filterUsers,filterUser,getUsersFeed } = require('../controllers/filterController');
const { protect,admin} = require("../middlewares/authMiddleware");
const User = require('../models/User');

router.get('/filter-users',protect, filterUsers);
router.get('/feed',protect, getUsersFeed);


module.exports = router;
