const VerificationRequest = require('../models/VerificationRequest');
const path = require('path');
const fs = require('fs');

exports.submitVerification = async (req, res) => {
  try {
    const { idType, idNumber, fullName } = req.body;
    const frontIdImage = req.files?.frontIdImage?.[0]?.path; // ✅ Path for front ID image
    const backIdImage = req.files?.backIdImage?.[0]?.path; // ✅ Path for back ID image

    // Validate inputs
    if (!idType || !idNumber || !fullName || !frontIdImage || !backIdImage) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the user already submitted a verification request
    const existing = await VerificationRequest.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a verification request.' });
    }

    // Create the verification request
    const request = await VerificationRequest.create({
      user: req.user.id,
      fullName,
      idType,
      idNumber,
      frontIdImage,
      backIdImage
    });

    res.status(201).json({ message: 'Verification request submitted.', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVerificationRequests = async (req, res) => {
  try {
    const requests = await VerificationRequest.find().populate('user');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await VerificationRequest.findByIdAndUpdate(id, {
      status,
      reviewedAt: new Date(),
      reviewer: req.user.id
    }, { new: true });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: `User ${status}.`, request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
