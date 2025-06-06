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
      status,
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
    const parsedRules = parseIfString(house_rules) || {};
    const parsedAmenities = parseIfString(amenities) || [];
    const parsedPhotos = parseIfString(photos) || [];

      console.log(parsedRules)
    // Validate house_rules ObjectId
    // if (!mongoose.Types.ObjectId.isValid(rules)) {
    //   return res.status(400).json({ error: 'Invalid house_rules ID' });
    // }

    const imageFilenames = req.files
      ? req.files.map(file => `uploads/houselistings/${file.filename}`)
      : [];

    const newListing = new HouseListing({
      user_id: req.user._id,
      provider: req.user.role === 'houseprovider' ? req.user._id : null,
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
      house_rules: parsedRules,
      status: status,
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
    const parsedRules = parseIfString(house_rules) || {};
    const parsedAmenities = parseIfString(amenities) || [];
    const parsedPhotos = parseIfString(photos) || [];

    // Validate house_rules ObjectId
    // if (house_rules && !mongoose.Types.ObjectId.isValid(house_rules)) {
    //   return res.status(400).json({ error: 'Invalid house_rules ID' });
    // }

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
      .populate('house_rules', 'name description') // Correct field name here
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
    const listings = await HouseListing.aggregate([
      { $sort: { createdAt: -1 } },

      // Join with User
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      //join with house rules
      {
        $lookup: {
          from: 'houserules',
          localField: 'house_rules',
          foreignField: '_id',
          as: 'house_rules'
        }
      },

      // Join with Profile (reverse lookup via user._id = profile.user)
      {
        $lookup: {
          from: 'profiles',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $project: { phone_number: 1, social_media_links: 1 } }
          ],
          as: 'user.profile'
        }
      },
      {
        $unwind: {
          path: '$user.profile',
          preserveNullAndEmptyArrays: true
        }
      },

      // Optionally join with provider
      {
        $lookup: {
          from: 'providers',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $unwind: {
          path: '$provider',
          preserveNullAndEmptyArrays: true
        }
      },

      // Final result projection - include all listing fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rent: 1,  // Rent details
          address: 1,  // Address details
          bedrooms: 1,
          bathrooms: 1,
          amenities: 1,
          images: 1,
          availableFrom: 1,
          house_rules: 1, // Rules details
          status: 1, // Listing status
          photos: 1, // Photos array
          createdAt: 1,
          user_id: '$user._id',
          'user.name': 1,
          'user.profile.phone_number': 1,
          'user.profile.social_media_links': 1,
          'provider.companyName': 1,
          'provider.contactPhone': 1,
        }
      }
    ]);

    res.json(listings);
  } catch (err) {
    console.error('Error fetching all listings:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};




const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Requested Listing ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const listings = await HouseListing.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // Join with User
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      // Join with Profile based on user._id
      {
        $lookup: {
          from: 'profiles',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $project: { phone_number: 1, social_media_links: 1 } }
          ],
          as: 'user.profile'
        }
      },
      {
        $unwind: {
          path: '$user.profile',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $lookup: {
          from: 'houserules',
          localField: 'house_rules',
          foreignField: '_id',
          as: 'house_rules'
        }
      },

      // Join with provider
      {
        $lookup: {
          from: 'providers',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $unwind: {
          path: '$provider',
          preserveNullAndEmptyArrays: true
        }
      },

      // Join with rules (optional)
      {
        $lookup: {
          from: 'rules',
          localField: 'rules',
          foreignField: '_id',
          as: 'rules'
        }
      },

      // Final projection - Include all HouseListing fields
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rent: 1,  // Rent details
          address: 1,  // Address details
          bedrooms: 1,
          bathrooms: 1,
          amenities: 1,
          images: 1,
          availableFrom: 1,
          house_rules: 1, // Rules details
          status: 1, // Listing status
          photos: 1, // Photos array
          createdAt: 1,
          user_id: '$user._id',
          'user.name': 1,
          'user.profile.phone_number': 1,
          'user.profile.social_media_links': 1,
          'provider.companyName': 1,
          'provider.contactPhone': 1,
        }
      }
    ]);

    if (!listings.length) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json(listings[0]);
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};






const getListingsFeed = async (req, res) => {
  try {
    const listings = await HouseListing.aggregate([
      { $match: { status: 'available' } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },

      // Join with User
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      // Join with Profile of the user
      {
        $lookup: {
          from: 'profiles',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $project: { phone_number: 1, social_media_links: 1 } }
          ],
          as: 'user.profile'
        }
      },
      {
        $unwind: {
          path: '$user.profile',
          preserveNullAndEmptyArrays: true
        }
      },

      // Join with rules
      {
        $lookup: {
          from: 'rules',
          localField: 'rules',
          foreignField: '_id',
          as: 'rules'
        }
      },

      // Final projection to include all necessary fields and user_id
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rent: 1,  // Rent details
          address: 1,  // Address details
          bedrooms: 1,
          bathrooms: 1,
          amenities: 1,
          images: 1,
          availableFrom: 1,
          status: 1,  // Listing status
          photos: 1,  // Photos array
          createdAt: 1,
          user_id: '$user._id',  // Adding user_id beside user data
          user: {
            fullName: '$user.fullName',
            profilePicture: '$user.profilePicture',
            profile: '$user.profile'
          },
          rules: {
            $map: {
              input: '$rules',
              as: 'rule',
              in: {
                name: '$$rule.name',
                description: '$$rule.description'
              }
            }
          }
        }
      }
    ]);

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

    let matchStage = {};

    // Price Filter
    if (minPrice || maxPrice) {
      matchStage['rent.amount'] = {};
      if (minPrice) matchStage['rent.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) matchStage['rent.amount'].$lte = parseFloat(maxPrice);
    }

    // City Filter (case-insensitive)
    if (city) {
      matchStage['address.city'] = new RegExp(city, 'i');
    }

    // Geo Filter
    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6378.1;
      matchStage['address.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
        }
      };
    }

    const listings = await HouseListing.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },

      // Lookup provider (if needed)
      {
        $lookup: {
          from: 'providers',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },

      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      // Lookup user profile
      {
        $lookup: {
          from: 'profiles',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $project: { phone_number: 1, social_media_links: 1 } }
          ],
          as: 'user.profile'
        }
      },
      { $unwind: { path: '$user.profile', preserveNullAndEmptyArrays: true } },

      // Lookup house rules
      {
        $lookup: {
          from: 'houserules',
          localField: 'house_rules',
          foreignField: '_id',
          as: 'house_rules'
        }
      },

      // Final projection
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          createdAt: 1,
          rent: 1,
          address: 1,
          provider: { companyName: '$provider.companyName' },
          user: {
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            profile: '$user.profile'
          },
          house_rules: {
            $map: {
              input: '$house_rules',
              as: 'rule',
              in: {
                name: '$$rule.name',
                description: '$$rule.description'
              }
            }
          }
        }
      }
    ]);

    res.json(listings);
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch listings', detail: error.message });
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
      if (isNaN(longitude) || isNaN(latitude)) {
        return res.status(400).json({ error: 'Invalid location coordinates' });
      }
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

    const listings = await HouseListing.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },

      // Lookup provider (if needed)
      {
        $lookup: {
          from: 'providers',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },

      // Lookup user
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      // Lookup user profile
      {
        $lookup: {
          from: 'profiles',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $project: { phone_number: 1, social_media_links: 1 } }
          ],
          as: 'user.profile'
        }
      },
      { $unwind: { path: '$user.profile', preserveNullAndEmptyArrays: true } },

      // Lookup house rules
      {
        $lookup: {
          from: 'houserules',
          localField: 'house_rules',
          foreignField: '_id',
          as: 'house_rules'
        }
      },

      // Final projection
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          createdAt: 1,
          rent: 1,
          address: 1,
          provider: { companyName: '$provider.companyName' },
          user: {
            first_name: '$user.first_name',
            last_name: '$user.last_name',
            profile: '$user.profile',
            user_id: '$user._id'  // Adding the user_id alongside user data
          },
          house_rules: {
            $map: {
              input: '$house_rules',
              as: 'rule',
              in: {
                name: '$$rule.name',
                description: '$$rule.description'
              }
            }
          }
        }
      }
    ]);

    if (listings.length === 0) {
      return res.status(404).json({ message: 'No listings found' });
    }

    res.json(listings);
  } catch (err) {
    console.error('Error searching listings:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageObjects = req.files.map(file => ({
      id: uuidv4(),
      url: file.path, // Cloudinary URL
      filename: file.filename,
      mimetype: file.mimetype,
      description: '' // Optional: add from req.body if needed
    }));

    listing.photos.push(...imageObjects);
    await listing.save();

    res.status(200).json({
      message: 'Images uploaded successfully to Cloudinary',
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


const cloudinary = require('../config/cloudinary'); // your configured Cloudinary instance

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

    // Delete images from Cloudinary that are not in keepImages
    const imagesToDelete = listing.photos.filter(photo => !keepImages.includes(photo.id));
    for (const photo of imagesToDelete) {
      if (photo.public_id) {
        try {
          await cloudinary.uploader.destroy(photo.public_id);
        } catch (err) {
          console.warn(`Cloudinary deletion failed for ${photo.public_id}`, err.message);
        }
      }
    }

    // Keep only those requested
    const updatedPhotos = listing.photos.filter(photo => keepImages.includes(photo.id));

    // Add new uploaded files from Cloudinary
    for (const file of req.files) {
      const uuid = uuidv4();
      updatedPhotos.push({
        id: uuid,
        url: file.path, // Cloudinary URL
        filename: file.filename,
        mimetype: file.mimetype,
        public_id: file.filename.split('.')[0], // If public_id is saved like filename
        description: '' // Optional field
      });
    }

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