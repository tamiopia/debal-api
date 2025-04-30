const HouseListing = require('../models/HouseListing');

// Create new listing
const createListing = async (req, res) => {
  try {
    const provider = await HouseProvider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(403).json({ error: 'Only verified providers can create listings' });
    }

    const listingData = {
      provider: provider._id,
      ...req.body
    };

    // Handle image uploads
    if (req.files) {
      listingData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const listing = await HouseListing.create(listingData);
    
    // Add to provider's properties
    await HouseProvider.findByIdAndUpdate(provider._id, {
      $push: { properties: listing._id }
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
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


module.exports = { searchListings, createListing,getLocationBasedFeed };