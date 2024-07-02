const express = require('express');
const router = express.Router();
const { uploadFile, getFileCount, getFilesByGoodsNo, downloadFile } = require('../controllers/fileController');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', uploadFile);
router.get('/count', getFileCount);
router.get('/goods/:goodsNo', getFilesByGoodsNo); // 경로 수정
router.get('/download/:fileNo/:fileSn', downloadFile);

module.exports = router;
