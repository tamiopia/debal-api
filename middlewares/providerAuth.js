const HouseProvider = require('../models/HouseProvider');

module.exports = async (req, res, next) => {
  try {
    const provider = await HouseProvider.findOne({ user: req.user.id });
    if (!provider || !provider.verified) {
      return res.status(403).json({ error: 'Provider verification required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};