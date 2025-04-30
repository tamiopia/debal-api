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
    getProviderById
    

};