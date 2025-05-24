// controllers/GuarantorController.js
const Guarantor = require('../models/Guarantor');
const User = require('../models/User');  // Assuming you have a User model
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Create a new guarantor
exports.create = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have user authentication middleware
      const { guarantorName, address, work, phoneNumber } = req.body;
      const files = req.files;
  
      const guarantorImage = files?.guarantorImage?.[0];
      const verificationCard = files?.verificationCard?.[0];
  
      if (!guarantorImage || !verificationCard) {
        return res.status(400).json({ success: false, message: 'Both images are required.' });
      }
  
      // Uploading to Cloudinary using local temp file paths
      const guarantorImageUpload = await cloudinary.uploader.upload(guarantorImage.path, {
        folder: 'guarantors/images'
      });
  
      const verificationCardUpload = await cloudinary.uploader.upload(verificationCard.path, {
        folder: 'guarantors/cards'
      });
  
      const newGuarantor = new Guarantor({
        userId,
        guarantorName,
        guarantorImage: guarantorImageUpload.secure_url,
        address,
        work,
        verificationCard: verificationCardUpload.secure_url,
        phoneNumber,
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
