// routes/user.js or routes/filter.js
const express = require('express');
const router = express.Router();
const { filterUsers,filterUser } = require('../controllers/filterController');
const { protect,admin} = require("../middlewares/authMiddleware");
const User = require('../models/User');

router.get('/filter-users',protect, filterUsers);
router.get('/filter-user',protect, filterUser);


module.exports = router;
