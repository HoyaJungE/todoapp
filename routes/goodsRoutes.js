const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goodsController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', goodsController.getGoods);
router.get('/latest/', goodsController.getLatestGoods);
router.get('/:id', goodsController.getGoodById);
router.post('/', upload.single('GOODS_IMG'), goodsController.addGood);
router.put('/:id', upload.single('GOODS_IMG'), goodsController.updateGood);

module.exports = router;
