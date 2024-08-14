// routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Define routes for menu operations
router.get('/', memberController.getMembers);

module.exports = router;
