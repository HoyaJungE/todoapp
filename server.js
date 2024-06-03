const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5000;

const SECRET_KEY = 'your_secret_key'; // JWT secret key

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/api/goods', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await db.execute(`
            SELECT * FROM (
                              SELECT a.*, ROWNUM rnum FROM (
                                                               SELECT * FROM GOODS ORDER BY GOODS_NO DESC
                                                           ) a WHERE ROWNUM <= :limit + :offset
                          ) WHERE rnum > :offset
        `, { limit: parseInt(limit, 10), offset: parseInt(offset, 10) });

        const totalResult = await db.execute(`SELECT COUNT(*) AS total FROM GOODS`);
        const total = totalResult.rows[0].TOTAL;

        res.json({ goods: result.rows, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/goods/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute(`
            SELECT * FROM GOODS WHERE GOODS_NO = :GOODS_NO
        `, { GOODS_NO: id });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/goods', upload.single('GOODS_IMG'), async (req, res) => {
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL } = req.body;
    const GOODS_IMG = req.file ? req.file.buffer : null;
    try {
        const result = await db.execute(`
      INSERT INTO GOODS (
        GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, 
        GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, GOODS_IMG
      ) VALUES (
        GOODS_NO_SEQ.NEXTVAL, :GOODS_CATEGORY, :GOODS_NAME, :GOODS_CONTENT, :GOODS_ORIGIN_PRICE, 
        :GOODS_SELL_PRICE, :GOODS_SALE_PRICE, TO_DATE(:GOODS_DATE, 'YYYY-MM-DD'), :GOODS_KEYWORD, :GOODS_THUMBNAIL, :GOODS_IMG
      )
    `, { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE: GOODS_DATE.split('T')[0], GOODS_KEYWORD, GOODS_THUMBNAIL, GOODS_IMG }, { autoCommit: true });
        res.json({ message: 'Goods added', id: result.lastRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/goods/:id', upload.single('GOODS_IMG'), async (req, res) => {
    const { id } = req.params;
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL } = req.body;
    const GOODS_IMG = req.file ? req.file.buffer : null;
    try {
        const result = await db.execute(`
      UPDATE GOODS 
      SET 
        GOODS_CATEGORY = :GOODS_CATEGORY, 
        GOODS_NAME = :GOODS_NAME, 
        GOODS_CONTENT = :GOODS_CONTENT, 
        GOODS_ORIGIN_PRICE = :GOODS_ORIGIN_PRICE, 
        GOODS_SELL_PRICE = :GOODS_SELL_PRICE, 
        GOODS_SALE_PRICE = :GOODS_SALE_PRICE, 
        GOODS_DATE = TO_DATE(:GOODS_DATE, 'YYYY-MM-DD'), 
        GOODS_KEYWORD = :GOODS_KEYWORD, 
        GOODS_THUMBNAIL = :GOODS_THUMBNAIL,
        GOODS_IMG = :GOODS_IMG
      WHERE GOODS_NO = :GOODS_NO
    `, { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE: GOODS_DATE.split('T')[0], GOODS_KEYWORD, GOODS_THUMBNAIL, GOODS_IMG, GOODS_NO: id }, { autoCommit: true });
        res.json({ message: 'Goods updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/signup', async (req, res) => {
    const { MEMBER_ID, MEMBER_PASSWD, MEMBER_NAME, MEMBER_BIRTH, MEMBER_EMAIL, MEMBER_PHONE, MEMBER_ZIPCODE, MEMBER_ADDR1, MEMBER_ADDR2, SMS_AGREE, EMAIL_AGREE } = req.body;
    try {
        const result = await db.execute(`
            INSERT INTO MEMBER (
                MEMBER_NO, MEMBER_ID, MEMBER_PASSWD, MEMBER_NAME, MEMBER_BIRTH,
                MEMBER_EMAIL, MEMBER_PHONE, MEMBER_ZIPCODE, MEMBER_ADDR1, MEMBER_ADDR2,
                MEMBER_DATE, MEMBER_GRADE, MEMBER_TOTAL, MEMBER_LOG, MEMBER_DELETE, SMS_AGREE, EMAIL_AGREE
            ) VALUES (
                         MEMBER_NO_SEQ.NEXTVAL, :MEMBER_ID, :MEMBER_PASSWD, :MEMBER_NAME, TO_DATE(:MEMBER_BIRTH, 'YYYY-MM-DD'),
                         :MEMBER_EMAIL, :MEMBER_PHONE, :MEMBER_ZIPCODE, :MEMBER_ADDR1, :MEMBER_ADDR2,
                         SYSDATE, 'basic', 0, SYSDATE, '0', :SMS_AGREE, :EMAIL_AGREE
                     )
        `, { MEMBER_ID, MEMBER_PASSWD, MEMBER_NAME, MEMBER_BIRTH, MEMBER_EMAIL, MEMBER_PHONE, MEMBER_ZIPCODE, MEMBER_ADDR1, MEMBER_ADDR2, SMS_AGREE, EMAIL_AGREE }, { autoCommit: true });

        const newUser = await db.execute(`
            SELECT * FROM MEMBER WHERE MEMBER_ID = :MEMBER_ID
        `, { MEMBER_ID });

        const token = jwt.sign({ id: newUser.rows[0].MEMBER_NO }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: 'User signed up', user: newUser.rows[0], token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { MEMBER_ID, MEMBER_PASSWD } = req.body;
    try {
        const result = await db.execute(`
            SELECT * FROM MEMBER WHERE MEMBER_ID = :MEMBER_ID AND MEMBER_PASSWD = :MEMBER_PASSWD
        `, { MEMBER_ID, MEMBER_PASSWD });
        if (result.rows.length > 0) {
            const token = jwt.sign({ id: result.rows[0].MEMBER_NO }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'User logged in', user: result.rows[0], token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    try {
        await db.initialize();
        console.log('Connected to Oracle database');
        console.log(`Server running on port ${port}`);
    } catch (err) {
        console.error('Failed to connect to Oracle database', err);
    }
});
