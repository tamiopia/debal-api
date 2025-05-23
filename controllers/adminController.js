// adminControllers.js
const User = require("../models/User");
const express = require('express');






const getAllUsers = async (req, res) => {

    try {
        // Logic to fetch all users
        const users = await User.find({role: 'user'});
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
} 

const getUserById = async (req, res) => {

    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
        // Logic to fetch user by ID
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllProviders = async (req, res) => {

    try{
        // Logic to fetch all house providers
        const providers = await User.find({ role: 'houseprovider' });
        res.status(200).json({ success: true, data: providers });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
   }
const getProviderById = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await User.findById(id);
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }
        res.status(200).json({ success: true, data: provider });
        // Logic to fetch provider by ID
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const getAdmins = async (req, res) => {
    try {
        // Logic to fetch all admins
        const admins = await User.find({ role: 'admin' });
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.status(200).json({ success: true, data: admin });
        // Logic to fetch admin by ID
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createAdmin = async (req, res) => {
    try {
        const adminData = req.body;
        req.body.role = 'admin'; // Set the role to admin
        // Logic to create a new admin
        if(req.body.role !== 'admin') {
            return res.status(400).json({ success: false, message: "Role must be admin" });
        }

        const newAdmin = new User(adminData);

        await newAdmin.save();
        res.status(201).json({ success: true, data: newAdmin });
         
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedAdmin = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({ success: true, data: updatedAdmin });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
  
const suspendadmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.issuspended = true; // Assuming you have a field to mark suspension
        await user.save();
        res.status(200).json({ success: true, message: "User suspended successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdmin = await User.findByIdAndDelete(id);
        if (!deletedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        res.status(200).json({ success: true, message: "Admin deleted successfully" });
       
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const promoteToAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.role = 'admin';
        await user.save();
        res.status(200).json({ success: true, message: "User promoted to admin", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const blockadmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.isblocked = true; // Assuming you have a field to mark blocking
        await admin.save();
        res.status(200).json({ success: true, message: "Admin blocked successfully", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
//cose to block user
const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.isblocked = true; // Assuming you have a field to mark blocking
        await user.save();
        res.status(200).json({ success: true, message: "User blocked successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// code to unblock user
const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.isblocked = false; // Assuming you have a field to mark unblocking
        await user.save();
        res.status(200).json({ success: true, message: "User unblocked successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// code to unbolck admin
const unblockadmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.isblocked = false; // Assuming you have a field to mark unblocking
        await admin.save();
        res.status(200).json({ success: true, message: "Admin unblocked successfully", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// code to suspend user
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.issuspended = true; // Assuming you have a field to mark suspension
        await user.save();
        res.status(200).json({ success: true, message: "User suspended successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const unsuspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.issuspended = false; // Assuming you have a field to mark unsuspension
        await user.save();
        res.status(200).json({ success: true, message: "User unsuspended successfully", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// code to unsuspend admin
const unsuspendAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.issuspended = false; // Assuming you have a field to mark unsuspension
        await admin.save();
        res.status(200).json({ success: true, message: "Admin unsuspended successfully", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const unassignAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await User.findById(id);
        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.role = 'user';
        await admin.save();
        res.status(200).json({ success: true, message: "Admin role unassigned", data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const UserReport = require('../models/UserReport');
const UserFeedback = require('../models/UserFeedback');
 // Assuming you have a User model

 const getAllFeedback = async (req, res) => {
    try {
      const feedback = await UserFeedback.find().populate('userId', 'name email');
      res.json({ feedback });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get feedback' });
    }
  };
  
  // Get all reports
  const getAllReports = async (req, res) => {
    try {
      const reports = await UserReport.find()
        .populate('reporterId', 'name email')
        .populate('reportedUserId', 'name email');
      res.json({ reports });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get reports' });
    }
  };
// Handle report and apply changes directly to the user
const handleReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminActionNote } = req.body;

    if (!['pending', 'blocked', 'suspended', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await UserReport.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const reportedUser = await User.findById(report.reportedUserId);
    if (!reportedUser) return res.status(404).json({ error: 'Reported user not found' });

    // Handle actions based on report status
    if (status === 'blocked') {
      reportedUser.isblocked = true; // Block the user
      reportedUser.isreported = true; // Mark as reported
    } else if (status === 'suspended') {
      reportedUser.issuspended = true; // Suspend the user
    } else if (status === 'resolved') {
      // Resolve the report and remove any blocking or suspension
      reportedUser.isblocked = false;
      reportedUser.issuspended = false;
      reportedUser.isreported = false;
    }

    // Save the changes to the user
    await reportedUser.save();

    // Update the report status and add any admin notes
    report.status = status;
    report.adminActionNote = adminActionNote || '';
    report.updatedAt = new Date();
    await report.save();

    res.json({
      message: 'Report updated and user status modified successfully',
      report,
      user: reportedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update report or user status' });
  }
};
const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await UserReport.findById(reportId)
      .populate([
        {
          path: 'reportedUserId',
          select: '-password'
        },
        {
          path: 'reporterId',
          select: '-password'
        }
      ]);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({
      report
    });

  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Error fetching report' });
  }
};



  const getFeedbackById = async (req, res) => {
    try {
      const { feedbackId } = req.params;
  
      // Find the feedback by its ID
      const feedback = await Feedback.findById(feedbackId).populate('userId'); // Assuming `userId` is a reference to the User model
      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
  
      // If the feedback is found, return the feedback and associated user details
      res.status(200).json({
        feedback,
        user: feedback.userId // User's details who submitted the feedback
      });
    } catch (err) {
      console.error('Error fetching feedback:', err);
      res.status(500).json({ error: 'Error fetching feedback' });
    }
  };

module.exports = {
    getAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    promoteToAdmin,
    unassignAdmin,
    getAllUsers,
    getUserById,
    getAllProviders,
    getProviderById,
    getAllFeedback,
    getAllReports,
    handleReport,
    getReportById,
    getFeedbackById,
    suspendUser,
    blockadmin,
    unblockadmin,
    unsuspendAdmin,
    suspendadmin,
    blockUser,
    unblockUser,
    suspendUser,
    unsuspendUser
    
    

};