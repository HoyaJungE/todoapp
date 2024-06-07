// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Define routes for menu operations
router.get('/', menuController.getMenus);
router.get('/:id', menuController.getMenuById);
router.post('/', menuController.addMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

module.exports = router;
