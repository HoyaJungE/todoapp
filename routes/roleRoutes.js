// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Define routes for menu operations
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.addRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
