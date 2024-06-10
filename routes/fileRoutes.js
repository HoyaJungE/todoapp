const express = require('express');
const router = express.Router();
const { getFileCount, getFilesByGoodsNo } = require('../controllers/fileController');

router.get('/count', getFileCount);
router.get('/', getFilesByGoodsNo);

module.exports = router;
