const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');
const multer = require('multer');
const path = require('path');

// Set up file upload directory
const uploadDirectory = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.get('/', goodsController.getGoods);
router.get('/latest/', goodsController.getLatestGoods);
router.get('/:id', goodsController.getGoodById);
router.post('/', upload.single('FILE_NO'), goodsController.addGood);
router.put('/:id', upload.single('FILE_NO'), goodsController.updateGood);

module.exports = router;
