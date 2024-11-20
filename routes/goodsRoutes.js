const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addGood, getGoods, getGoodById, updateGood, getLatestGoods } = require('../controllers/goodsController');
const fs = require("fs");
const boardStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        //폴더없으면 폴더 생성
        let dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: boardStorage });

router.get('/', getGoods);
router.get('/latest', getLatestGoods);
router.get('/:id', getGoodById);

router.post('/', upload.array('files'), addGood);
router.put('/:id', upload.array('files'), updateGood);

module.exports = router;