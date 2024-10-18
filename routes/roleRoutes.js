// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/roleMembers', roleController.getRoleMembers);
router.get('/roleMenus', roleController.getRoleMenus);
router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.addRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.post('/addMemberRole', roleController.addMemberRole);
router.post('/deleteMemberRole', roleController.deleteMemberRole);
router.post('/addMRoleMenu', roleController.addRoleMenu);
router.post('/deleteRoleMenu', roleController.deleteRoleMenu);

module.exports = router;
