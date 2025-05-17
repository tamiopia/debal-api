const HouseRule = require('../models/houseRules'); // Assuming the model is in models/houseRules.js

// Helper to handle not found responses
const notFoundResponse = (res) => res.status(404).json({ error: 'House rule not found' });

// @desc    Create a new house rule
// @route   POST /api/house-rules
exports.createHouseRule = async (req, res) => {
    try {
        const { provider, name, description, isActive = true } = req.body;
        
        const houseRule = await HouseRule.create({
            user: req.user.id,  // From auth token
            provider,
            name,
            description,
            isActive
        });

        res.status(201).json(houseRule);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Get all house rules (for current user)
// @route   GET /api/house-rules
exports.getAllHouseRules = async (req, res) => {
    try {
        const { provider, active } = req.query;
        let query = { user: req.user.id };  // Only show rules for current user
        
        if (provider) {
            query.provider = provider;
        }
        
        if (active === 'true') {
            query.isActive = true;
        } else if (active === 'false') {
            query.isActive = false;
        }

        const houseRules = await HouseRule.find(query)
            .populate('provider', 'name')
            .sort({ createdAt: -1 });
            
        res.json(houseRules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get single house rule (only if belongs to current user)
// @route   GET /api/house-rules/:id
exports.getHouseRule = async (req, res) => {
    try {
        const houseRule = await HouseRule.findOne({
            _id: req.params.id,
            user: req.user.id  // Ensure rule belongs to current user
        }).populate('provider', 'name');
        
        if (!houseRule) return notFoundResponse(res);
        res.json(houseRule);
    } catch (err) {
        if (err.kind === 'ObjectId') return notFoundResponse(res);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update house rule (only if belongs to current user)
// @route   PUT /api/house-rules/:id
exports.updateHouseRule = async (req, res) => {
    try {
        const { provider, name, description, isActive } = req.body;
        
        const houseRule = await HouseRule.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id  // Ensure rule belongs to current user
            },
            { provider, name, description, isActive },
            { new: true, runValidators: true }
        ).populate('provider', 'name');

        if (!houseRule) return notFoundResponse(res);
        res.json(houseRule);
    } catch (err) {
        if (err.kind === 'ObjectId') return notFoundResponse(res);
        res.status(400).json({ error: err.message });
    }
};

// @desc    Delete house rule (only if belongs to current user)
// @route   DELETE /api/house-rules/:id
exports.deleteHouseRule = async (req, res) => {
    try {
        const houseRule = await HouseRule.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id  // Ensure rule belongs to current user
        });

        if (!houseRule) return notFoundResponse(res);
        res.json({ message: 'House rule removed' });
    } catch (err) {
        if (err.kind === 'ObjectId') return notFoundResponse(res);
        res.status(500).json({ error: err.message });
    }
};