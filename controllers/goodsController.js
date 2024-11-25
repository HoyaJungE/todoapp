const db = require('../db');
const { getNextFileNo, uploadFile } = require('./fileController');

exports.addGood = async (req, res) => {
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, WRTER_NO } = req.body;

    try {
        let FILE_NO = null;
        if (req.files && req.files.length > 0) {
            FILE_NO = await uploadFile(req, res, null);
            console.log(FILE_NO);
        }

        const query = `INSERT INTO GOODS (GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO, WRTER_NO)
            VALUES (GOODS_NO_SEQ.NEXTVAL, :GOODS_CATEGORY, :GOODS_NAME, :GOODS_CONTENT, :GOODS_ORIGIN_PRICE, :GOODS_SELL_PRICE, :GOODS_SALE_PRICE, TO_DATE(:GOODS_DATE, 'YYYY-MM-DD'), :GOODS_KEYWORD, :GOODS_THUMBNAIL, :FILE_NO, :WRTER_NO)
        `;
        const binds = { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO, WRTER_NO};
        await db.execute(query, binds);
        res.status(201).json({ message: 'Goods added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGoods = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await db.execute(`
            SELECT GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO, WRTER_NO, (SELECT MEMBER_NAME FROM MEMBER WHERE MEMBER_NO = WRTER_NO) AS WRTER_NM
            FROM (
                     SELECT a.*, ROWNUM rnum FROM (
                                                      SELECT GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO, WRTER_NO
                                                      FROM GOODS
                                                      ORDER BY GOODS_NO DESC
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
            SELECT GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO ,WRTER_NO, (SELECT MEMBER_NAME FROM MEMBER WHERE MEMBER_NO = WRTER_NO) AS WRTER_NM
            FROM GOODS
            WHERE GOODS_NO = :GOODS_NO
        `, { GOODS_NO: id });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateGood = async (req, res) => {
    const { id } = req.params;
    const { GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL } = req.body;
    let tmpFileNo = null;

    // 데이터베이스에서 파일 정보 가져오기
    const fileInfo = await db.execute(`
        SELECT FILE_NO, FILE_SN, FILE_PHYSC_NM, FILE_PATH, FILE_LOGIC_NM, FILE_EXTSN_NM, FILE_BYTE_SIZE, FILE_ORD
        FROM FILE_DTL
        WHERE FILE_NO = (SELECT FILE_NO FROM GOODS WHERE GOODS_NO = :GOODS_NO)
    `, { GOODS_NO: id });

    try {
        /* 기존 게시글매핑된 FILE_NO 에 파일이존재하면 */

        console.log(fileInfo.rows);
        console.log(fileInfo.rows.length);
        if(fileInfo.rows.length > 0){
            tmpFileNo = fileInfo.rows[0].FILE_NO;
        }else{
            tmpFileNo = null;
        }

        if (req.files && req.files.length > 0) {
            if(tmpFileNo == null){
                tmpFileNo = await getNextFileNo();
            }
            await uploadFile(req, res, tmpFileNo);
        }

        const query = `
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
                FILE_NO = :FILE_NO
            WHERE GOODS_NO = :GOODS_NO
        `;
        const binds = {
            GOODS_CATEGORY: GOODS_CATEGORY || null,
            GOODS_NAME: GOODS_NAME || null,
            GOODS_CONTENT: GOODS_CONTENT || null,
            GOODS_ORIGIN_PRICE: GOODS_ORIGIN_PRICE || null,
            GOODS_SELL_PRICE: GOODS_SELL_PRICE || null,
            GOODS_SALE_PRICE: GOODS_SALE_PRICE || null,
            GOODS_DATE: GOODS_DATE || null,
            GOODS_KEYWORD: GOODS_KEYWORD || null,
            GOODS_THUMBNAIL: GOODS_THUMBNAIL || null,
            FILE_NO: tmpFileNo || null,
            GOODS_NO: id
        };

        await db.execute(query, binds);
        res.json({ message: 'Goods updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLatestGoods = async (req, res) => {
    const { cnt = 3 } = req.query;

    try {
        const result = await db.execute(`
            SELECT GOODS_NO, GOODS_CATEGORY, GOODS_NAME, GOODS_CONTENT, GOODS_ORIGIN_PRICE, GOODS_SELL_PRICE, GOODS_SALE_PRICE, GOODS_DATE, GOODS_KEYWORD, GOODS_THUMBNAIL, FILE_NO, WRTER_NO
            FROM GOODS
            WHERE ROWNUM <= :cnt
            ORDER BY GOODS_NO DESC
        `, { cnt: parseInt(cnt, 10) });

        res.json({ goods: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
