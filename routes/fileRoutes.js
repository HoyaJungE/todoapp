const express = require('express');
const router = express.Router();
const { uploadFile, getFileCount, getFilesByGoodsNo, downloadFile } = require('../controllers/fileController');

router.post('/upload', uploadFile);
router.get('/count', getFileCount);
router.get('/goods/:goodsNo', getFilesByGoodsNo); // 경로 수정
router.get('/download/:fileNo/:fileSn', downloadFile);

module.exports = router;
