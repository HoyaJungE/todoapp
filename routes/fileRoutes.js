const express = require('express');
const router = express.Router();
const { uploadFile, getFileCount, getFilesByGoodsNo, downloadFile, deleteFile } = require('../controllers/fileController');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/count', getFileCount);
router.get('/goods/:goodsNo', getFilesByGoodsNo);
router.get('/download/:fileNo/:fileSn', downloadFile);
router.delete('/delete/:fileNo/:fileSn', deleteFile); // 변경된 부분
router.post('/upload', upload.array('files'), uploadFile); // 다중 파일 업로드 가능

module.exports = router;
