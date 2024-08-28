// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Define routes for menu operations
router.get('/roleMembers', roleController.getRoleMembers);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.addRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.post('/addMemberRole', roleController.addMemberRole);
router.post('/deleteMemberRole', roleController.deleteMemberRole);

module.exports = router;
