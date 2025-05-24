// controllers/GuarantorController.js
const Guarantor = require('../models/Guarantor');
const User = require('../models/User');  // Assuming you have a User model
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Create a new guarantor
exports.create = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming authenticated user
      const { guarantorName, address, work, phoneNumber } = req.body;
      const files = req.files;
  
      const guarantorImage = files?.guarantorImage?.[0];
      const verificationCard = files?.verificationCard?.[0];
  
      if (!guarantorImage && !verificationCard) {
        return res.status(400).json({
          success: false,
          message: 'At least one image (guarantorImage or verificationCard) is required.'
        });
      }
  
      // Upload new files if provided
      let guarantorImageUrl, verificationCardUrl;
      if (guarantorImage) {
        const upload = await cloudinary.uploader.upload(guarantorImage.path, {
          folder: 'guarantors/images'
        });
        guarantorImageUrl = upload.secure_url;
      }
  
      if (verificationCard) {
        const upload = await cloudinary.uploader.upload(verificationCard.path, {
          folder: 'guarantors/cards'
        });
        verificationCardUrl = upload.secure_url;
      }
  
      // Check if guarantor already exists for user
      let existingGuarantor = await Guarantor.findOne({ userId });
  
      if (existingGuarantor) {
        // Update the existing guarantor
        existingGuarantor.guarantorName = guarantorName || existingGuarantor.guarantorName;
        existingGuarantor.address = address || existingGuarantor.address;
        existingGuarantor.work = work || existingGuarantor.work;
        existingGuarantor.phoneNumber = phoneNumber || existingGuarantor.phoneNumber;
        existingGuarantor.guarantorImage = guarantorImageUrl || existingGuarantor.guarantorImage;
        existingGuarantor.verificationCard = verificationCardUrl || existingGuarantor.verificationCard;
        existingGuarantor.status = 'active';
  
        await existingGuarantor.save();
  
        return res.status(200).json({
          success: true,
          message: 'Guarantor updated successfully!',
          data: existingGuarantor
        });
      }
  
      // Create new guarantor
      const newGuarantor = new Guarantor({
        userId,
        guarantorName,
        address,
        work,
        phoneNumber,
        guarantorImage: guarantorImageUrl,
        verificationCard: verificationCardUrl,
        status: 'active'
      });
  
      await newGuarantor.save();
  
      res.status(201).json({
        success: true,
        message: 'Guarantor created successfully!',
        data: newGuarantor
      });
  
    } catch (error) {
      console.error('Error uploading to Cloudinary or saving guarantor:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  

// Admin verifies a guarantor
exports.verify = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const guarantor = await Guarantor.findById(id);

    if (!guarantor) {
      return res.status(404).json({ success: false, message: 'Guarantor not found' });
    }

    // Assume we have a way to check if the user is admin (JWT token or session-based authentication)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update verification status
    guarantor.verificationStatus = verificationStatus;
    await guarantor.save();

    res.status(200).json({
      success: true,
      message: `Guarantor verification status updated to ${verificationStatus}`,
      data: guarantor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all guarantors 
exports.getAll = async (req, res) => {
  try {
    const guarantors = await Guarantor.find().populate('userId', 'name email');
    res.status(200).json({
      success: true,
      data: guarantors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getGuarantorById = async (req, res) => {
    try {
        const { id } = req.params;
        const guarantor = await Guarantor.findById(id).populate('userId', 'name email');
        if (!guarantor) {
            return res.status(404).json({ success: false, message: 'Guarantor not found' });
        }
        res.status(200).json({
            success: true,
            data: guarantor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// get guarantor by userId
exports.getGuarantorByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const guarantor = await Guarantor.findOne({ userId }).populate('userId', 'name email');
        if (!guarantor) {
            return res.status(404).json({ success: false, message: 'Guarantor not found' });
        }
        res.status(200).json({
            success: true,
            data: guarantor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

