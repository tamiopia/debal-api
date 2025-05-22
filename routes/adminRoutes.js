const express = require('express');
const adminController = require('../controllers/adminController');
const { protect,admin,superadmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Import controllers

router.get('/allusers',adminController.getAllUsers);
router.get('/user/:id',adminController.getUserById);
router.get('/allproviders',protect,admin,adminController.getAllProviders);
router.get('/provider/:id',protect,admin,adminController.getProviderById);
router.get('/alladmins',protect ,superadmin, adminController.getAdmins);
router.post('/create',protect ,superadmin, adminController.createAdmin);
router.patch('/:id/update',protect ,superadmin, adminController.updateAdmin);
router.delete('/:id/delete',protect ,superadmin, adminController.deleteAdmin);
router.patch('/:id/promote',protect ,superadmin, adminController.promoteToAdmin);
router.patch('/:id/uassign',protect ,superadmin, adminController.unassignAdmin);
router.get('/getreports',protect ,admin, adminController.getAllReports);
router.get('/getreports/:id',protect ,admin, adminController.getReportById);
router.post('/handlereport/:id',protect ,admin, adminController.handleReport);
router.get('/allfeedback',protect ,admin, adminController.getAllFeedback);
router.get('/allfeedback/:id',protect ,admin, adminController.getFeedbackById);





// Define routes
// router.get('/dashboard', adminController.getDashboard);
// router.post('/create', adminController.createAdmin);
// router.put('/update/:id', adminController.updateAdmin);
// router.delete('/delete/:id', adminController.deleteAdmin);

module.exports = router;