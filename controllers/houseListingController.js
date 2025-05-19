const HouseListing = require('../models/HouseListing');
const HouseProvider = require('../models/HouseProvider');
const HouseRule = require('../models/houseRules');
const User = require('../models/User');

const mongoose = require('mongoose');

// Create a new house listing
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      rent,
      bedrooms,
      bathrooms,
      amenities,
      availableFrom,
      rules,
      house_rules,
      photos // this should be a JSON stringified array from the frontend
    } = req.body;

    const parseIfString = (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          console.warn(`Failed to parse value: ${val}`);
          return val;
        }
      }
      return val;
    };

    const parsedAddress = parseIfString(address) || {};
    const parsedRent = parseIfString(rent) || {};
    const parsedRules = parseIfString(rules) || {};
    const parsedAmenities = parseIfString(amenities) || [];
    const parsedPhotos = parseIfString(photos) || [];

    // Validate house_rules ObjectId
    if (!mongoose.Types.ObjectId.isValid(house_rules)) {
      return res.status(400).json({ error: 'Invalid house_rules ID' });
    }

    const imageFilenames = req.files
      ? req.files.map(file => `uploads/houselistings/${file.filename}`)
      : [];

    const newListing = new HouseListing({
      user_id: req.user._id,
      provider: req.user.role === 'provider' ? req.user._id : null,
      house_rules: house_rules,
      title,
      description,
      address: {
        ...parsedAddress,
        coordinates: parsedAddress.coordinates || [0, 0]
      },
      rent: parsedRent,
      bedrooms,
      bathrooms,
      amenities: parsedAmenities,
      availableFrom,
      rules: parsedRules,
      status: 'available',
      images: imageFilenames,
      photos: parsedPhotos
    });

    const saved = await newListing.save();

    res.status(201).json({ message: 'House listing created successfully', listing: saved });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({
      error: 'Failed to create listing',
      detail: err.message
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    // Parse potentially stringified JSON fields
    const parseIfString = (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          console.warn(`Failed to parse value: ${val}`);
          return val;
        }
      }
      return val;
    };

    const {
      title,
      description,
      address,
      rent,
      bedrooms,
      bathrooms,
      amenities,
      availableFrom,
      rules,
      house_rules,
      photos
    } = req.body;

    const parsedAddress = parseIfString(address) || {};
    const parsedRent = parseIfString(rent) || {};
    const parsedRules = parseIfString(rules) || {};
    const parsedAmenities = parseIfString(amenities) || [];
    const parsedPhotos = parseIfString(photos) || [];

    // Validate house_rules ObjectId
    if (house_rules && !mongoose.Types.ObjectId.isValid(house_rules)) {
      return res.status(400).json({ error: 'Invalid house_rules ID' });
    }

    const imageFilenames = req.files
      ? req.files.map(file => `uploads/houselistings/${file.filename}`)
      : [];

    // Prepare update object
    const updatedData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(address && {
        address: {
          ...parsedAddress,
          coordinates: parsedAddress.coordinates || [0, 0]
        }
      }),
      ...(rent && { rent: parsedRent }),
      ...(bedrooms && { bedrooms }),
      ...(bathrooms && { bathrooms }),
      ...(amenities && { amenities: parsedAmenities }),
      ...(availableFrom && { availableFrom }),
      ...(rules && { rules: parsedRules }),
      ...(house_rules && { house_rules }),
      ...(photos && { photos: parsedPhotos }),
    };

    if (imageFilenames.length > 0) {
      updatedData.images = imageFilenames;
    }

    const updatedListing = await HouseListing.findByIdAndUpdate(
      listingId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json({
      message: 'House listing updated successfully',
      listing: updatedListing
    });

  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({
      error: 'Failed to update listing',
      detail: err.message
    });
  }
};




const getMyListings = async (req, res) => {
  try {
    const userId = req.user._id;

    const listings = await HouseListing.find({ user_id: userId })
      .populate('rules') // Correct field name here
      .sort({ createdAt: -1 });

    res.status(200).json({ listings });
  } catch (err) {
    console.error('Get my listings error:', err);
    res.status(500).json({
      error: 'Failed to retrieve listings',
      detail: err.message
    });
  }
};


const getListingsFeed = async (req, res) => {
  try {
    const listings = await HouseListing.find({ status: 'available' })
      .populate('user_id', 'fullName profilePicture') // get poster's name and photo
      .populate('rules', 'name description')     // rule details
      .sort({ createdAt: -1 }) // newest first
      .limit(50); // optional: limit number of listings

    res.status(200).json({ listings });
  } catch (err) {
    console.error('Feed fetch error:', err.message);
    res.status(500).json({
      error: 'Failed to retrieve feed',
      detail: err.message
    });
  }
};



// Get filtered house listings (feed)
exports.getHouseListingFeed = async (req, res) => {
  try {
    const { minPrice, maxPrice, city, radius, lat, lng } = req.query;

    let filter = {};

    if (minPrice || maxPrice) {
      filter['rent.amount'] = {};
      if (minPrice) filter['rent.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['rent.amount'].$lte = parseFloat(maxPrice);
    }

    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }

    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6378.1;
      filter['address.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      };
    }

    const listings = await HouseListing.find(filter)
      .populate('provider', 'companyName')
      .populate('user_id', 'first_name last_name')
      .populate('house_rules')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// Search listings
const searchListings = async (req, res) => {
  try {
    const { minPrice, maxPrice, bedrooms, location, radius = 10 } = req.query;
    
    let query = { status: 'available' };

    // Price filter
    if (minPrice || maxPrice) {
      query['rent.amount'] = {};
      if (minPrice) query['rent.amount'].$gte = Number(minPrice);
      if (maxPrice) query['rent.amount'].$lte = Number(maxPrice);
    }

    // Bedrooms filter
    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    // Location filter
    if (location) {
      const [longitude, latitude] = location.split(',').map(Number);
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1609.34 // Convert miles to meters
        }
      };
    }

    const listings = await HouseListing.find(query)
      .populate('provider', 'companyName contactPhone');

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// In houseListingController.js
const getLocationBasedFeed = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10 } = req.query; // radius in miles
    const userId = req.user?.id; // Optional: for personalized ranking

    // 1. Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ error: "Coordinates required" });
    }

    // 2. Find listings within radius
    const listings = await HouseListing.find({
      "address.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1609.34, // Convert miles to meters
        },
      },
      status: "available",
    })
      .populate("provider", "companyName rating")
      .sort("-createdAt"); // Newest first

    // 3. Optional: Personalize ranking (example - boost matches with similar preferences)
    if (userId) {
      const userPrefs = await Preference.findOne({ user: userId });
      if (userPrefs) {
        listings.sort((a, b) => {
          return calculateListingScore(b, userPrefs) - calculateListingScore(a, userPrefs);
        });
      }
    }

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: Calculate personalized listing score
const calculateListingScore = (listing, userPrefs) => {
  let score = 0;
  
  // Example: Boost listings matching user's budget
  if (listing.rent.amount >= userPrefs.budgetMin && listing.rent.amount <= userPrefs.budgetMax) {
    score += 30;
  }

  // Add other preference-based scoring here
  return score;
};


module.exports = { searchListings,getMyListings,getListingsFeed, updateListing,createListing,getLocationBasedFeed };