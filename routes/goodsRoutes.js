const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addGood, getGoods, getGoodById, updateGood, getLatestGoods } = require('../controllers/goodsController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.array('files'), addGood);
router.get('/', getGoods);
router.get('/latest', getLatestGoods);
router.get('/:id', getGoodById);
router.put('/:id', upload.array('files'), updateGood);

module.exports = router;
