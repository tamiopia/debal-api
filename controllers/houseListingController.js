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
    const userId = req.user.id;
    console.log('User ID on listing:', userId);

    const listings = await HouseListing.find({ user_id: userId })
      .populate('rules')
      .populate('user_id', 'name') // Correct field name here
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

const getalllistings = async (req, res) => {
  try {
    const listings = await HouseListing.find()
      .populate('provider', 'companyName contactPhone')  // Populate provider details
      .populate({
        path: 'user_id',  // Populate the user model
        select: 'name',   // Select the name from the user model
        populate: {
          path: 'profile', // Populate the profile model related to user_id
          select: 'social_media_links phone_number' // Select profile fields
        }
      })
      .populate('rules')  // Populate the rules
      .sort({ createdAt: -1 });  // Sort by creation date

    res.json(listings);  // Send the populated listings
  } catch (error) {
    console.error('Error fetching all listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
}


const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Requested Listing ID:', req.params.id);


    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const listing = await HouseListing.findById(id)
      .populate('provider', 'name email')
      .populate('user_id', 'name') // adjust fields as needed
      .populate('rules'); // Optional: populate related rules

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json(listing);
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
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
      .populate('provider', 'companyName contactPhone')
      .populate('user_id', 'first_name last_name')
      .populate('house_rules')

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

const DeleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    const deletedListing = await HouseListing.findByIdAndDelete(listingId);

    if (!deletedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json({ message: 'House listing deleted successfully' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({
      error: 'Failed to delete listing',
      detail: err.message
    });
  }
}

const filterlistings = async (req, res) => {
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
}

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const uploadimages = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await HouseListing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const imageObjects = [];

    for (const file of req.files) {
      const uniqueId = uuidv4();
      const extension = path.extname(file.originalname);
      const newFilename = `${uniqueId}${extension}`;
      const newPath = path.join(file.destination, newFilename);

      // Rename the file to use the UUID-based name
      fs.renameSync(file.path, newPath);

      imageObjects.push({
        id: uniqueId,
        url: `uploads/${newFilename}`,
        description: '' // You can pass from req.body if needed
      });
    }

    listing.photos.push(...imageObjects);
    await listing.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: imageObjects
    });
  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({
      error: 'Failed to upload images',
      detail: err.message
    });
  }
};





// Update images for a listing

const updateimages = async (req, res) => {
  try {
    const { listingId } = req.params;
    const keepImages = req.body.keepImages ? JSON.parse(req.body.keepImages) : [];

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await HouseListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Delete any image not in keepImages
    const imagesToDelete = listing.photos.filter(photo => !keepImages.includes(photo.id));
    for (const photo of imagesToDelete) {
      const fullPath = path.join(__dirname, '..', photo.url);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Keep only those requested
    const updatedPhotos = listing.photos.filter(photo => keepImages.includes(photo.id));

    // Add new images with UUIDs
    for (const file of req.files) {
      const uuid = uuidv4();
      const ext = path.extname(file.originalname);
      const newFilename = `${uuid}${ext}`;
      const newPath = path.join(file.destination, newFilename);

      fs.renameSync(file.path, newPath); // rename file on disk

      updatedPhotos.push({
        id: uuid,
        url: `uploads/${newFilename}`,
        description: ''
      });
    }

    // Save updated list
    listing.photos = updatedPhotos;
    await listing.save();

    res.status(200).json({
      message: 'Images updated successfully',
      images: updatedPhotos
    });

  } catch (err) {
    console.error('Update images error:', err);
    res.status(500).json({
      error: 'Failed to update images',
      detail: err.message
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { listingId, imageId } = req.params; // Get listingId and imageId from URL params

    if (!listingId || !imageId) {
      return res.status(400).json({ error: 'Listing ID and Image ID are required' });
    }

    const listing = await HouseListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Find the image to remove in the listing
    const imageIndex = listing.photos.findIndex(photo => photo.id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found in listing' });
    }

    // Get the image path from the database
    const imageToDelete = listing.photos[imageIndex];
    const imagePath = path.join(__dirname, '..', imageToDelete.url);

    // Delete image from the server
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove image from the listing's photos array
    listing.photos.splice(imageIndex, 1);
    await listing.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      images: listing.photos
    });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({
      error: 'Failed to delete image',
      detail: err.message
    });
  }
};



module.exports = { searchListings,getMyListings,getListingsFeed, updateListing,createListing,getLocationBasedFeed,getListingById ,getalllistings,DeleteListing,filterlistings,uploadimages,updateimages,deleteImage};