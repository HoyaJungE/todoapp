const db = require('../db');

exports.getGoods = async (req, res) => {
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
};

exports.getGoodById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.execute(`
            SELECT * FROM GOODS WHERE GOODS_NO = :GOODS_NO
        `, { GOODS_NO: id });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addGood = async (req, res) => {
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_KEYWORD, GOODS_THUMBNAIL } = req.body;
    const GOODS_IMG = req.file ? req.file.buffer : null;

    try {
        const result = await db.execute(`
            INSERT INTO GOODS (
                GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE,
                GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, GOODS_IMG
            ) VALUES (
                GOODS_NO_SEQ.NEXTVAL, :GOODS_CATEGORY, :GOODS_NAME, :GOODS_CONTENT, :GOODS_ORIGIN_PRICE,
                :GOODS_SELL_PRICE, :GOODS_SALE_PRICE, SYSDATE, :GOODS_KEYWORD, :GOODS_THUMBNAIL, :GOODS_IMG
            )
        `, {
            GOODS_CATEGORY: GOODS_CATEGORY || null,
            GOODS_NAME: GOODS_NAME || null,
            GOODS_CONTENT: GOODS_CONTENT || null,
            GOODS_ORIGIN_PRICE: GOODS_ORIGIN_PRICE || null,
            GOODS_SELL_PRICE: GOODS_SELL_PRICE || null,
            GOODS_SALE_PRICE: GOODS_SALE_PRICE || null,
            GOODS_KEYWORD: GOODS_KEYWORD || null,
            GOODS_THUMBNAIL: GOODS_THUMBNAIL || null,
            GOODS_IMG: GOODS_IMG || null
        }, { autoCommit: true });
        res.json({ message: 'Goods added', id: result.lastRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateGood = async (req, res) => {
    const { id } = req.params;
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_KEYWORD, GOODS_THUMBNAIL } = req.body;
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
                GOODS_KEYWORD = :GOODS_KEYWORD, 
                GOODS_THUMBNAIL = :GOODS_THUMBNAIL,
                GOODS_IMG = :GOODS_IMG
            WHERE GOODS_NO = :GOODS_NO
        `, {
            GOODS_CATEGORY: GOODS_CATEGORY || null,
            GOODS_NAME: GOODS_NAME || null,
            GOODS_CONTENT: GOODS_CONTENT || null,
            GOODS_ORIGIN_PRICE: GOODS_ORIGIN_PRICE || null,
            GOODS_SELL_PRICE: GOODS_SELL_PRICE || null,
            GOODS_SALE_PRICE: GOODS_SALE_PRICE || null,
            GOODS_KEYWORD: GOODS_KEYWORD || null,
            GOODS_THUMBNAIL: GOODS_THUMBNAIL || null,
            GOODS_IMG: GOODS_IMG || null,
            GOODS_NO: id
        }, { autoCommit: true });
        res.json({ message: 'Goods updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLatestGoods = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT GOODS_NO
                   ,GOODS_CATEGORY
                   ,GOODS_NAME
                   ,GOODS_CONTENT
                   ,GOODS_ORIGIN_PRICE
                   ,GOODS_SELL_PRICE
                   ,GOODS_SALE_PRICE
                   ,GOODS_DATE
                   ,GOODS_KEYWORD
                   ,GOODS_READCNT
                   ,GOODS_PICK
                   ,GOODS_THUMBNAIL
                   ,GUBUN
                   ,GOODS_IMG
              FROM GOODS
             WHERE ROWNUM < 5
             ORDER BY GOODS_NO DESC          
        `, {});

        res.json({ goods: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};