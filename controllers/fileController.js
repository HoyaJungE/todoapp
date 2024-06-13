const path = require('path');
const db = require('../db');

async function getNextFileNo() {
    const result = await db.execute('SELECT FILE_NO_SEQ.NEXTVAL AS FILE_NO FROM DUAL');
    return result.rows[0].FILE_NO;
}

exports.uploadFile = async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        throw new Error('No files uploaded');
    }

    const fileNo = await getNextFileNo();
    const fileInserts = [];

    files.forEach((file, index) => {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        fileInserts.push({
            FILE_NO: fileNo,
            FILE_SN: index + 1,
            FILE_PHYSC_NM: file.filename,
            FILE_PATH: filePath,
            FILE_LOGIC_NM: file.originalname,
            FILE_EXTSN_NM: path.extname(file.originalname),
            FILE_BYTE_SIZE: file.size,
            FILE_ORD: index + 1
        });
    });

    const query = `
        INSERT INTO FILE_DTL (FILE_NO, FILE_SN, FILE_PHYSC_NM, FILE_PATH, FILE_LOGIC_NM, FILE_EXTSN_NM, FILE_BYTE_SIZE, FILE_ORD)
        VALUES (:FILE_NO, :FILE_SN, :FILE_PHYSC_NM, :FILE_PATH, :FILE_LOGIC_NM, :FILE_EXTSN_NM, :FILE_BYTE_SIZE, :FILE_ORD)
    `;

    try {
        for (const bind of fileInserts) {
            await db.execute(query, bind);
        }
        console.log('Files uploaded and database records created');
        res.json({ fileNo });
    } catch (error) {
        console.error('Error inserting file records into database:', error);
        throw new Error('Error inserting file records into database');
    }
};

exports.getFileCount = async (req, res) => {
    const { goodsNo } = req.query;

    try {
        const result = await db.execute(`
            SELECT COUNT(*) AS FILE_COUNT
            FROM FILE_DTL
            WHERE FILE_NO = (SELECT FILE_NO FROM GOODS WHERE GOODS_NO = :GOODS_NO)
        `, { GOODS_NO: goodsNo });

        res.json({ count: result.rows[0].FILE_COUNT });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFilesByGoodsNo = async (req, res) => {
    const { goodsNo } = req.params; // 변경된 부분

    try {
        const result = await db.execute(`
            SELECT FILE_NO, FILE_SN, FILE_PHYSC_NM, FILE_PATH, FILE_LOGIC_NM, FILE_EXTSN_NM, FILE_BYTE_SIZE, FILE_ORD
            FROM FILE_DTL
            WHERE FILE_NO = (SELECT FILE_NO FROM GOODS WHERE GOODS_NO = :GOODS_NO)
        `, { GOODS_NO: goodsNo });

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    const { fileNo, fileSn } = req.params;

    try {
        const result = await db.execute(`
            SELECT FILE_PATH, FILE_LOGIC_NM
            FROM FILE_DTL
            WHERE FILE_NO = :FILE_NO AND FILE_SN = :FILE_SN
        `, { FILE_NO: fileNo, FILE_SN: fileSn });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = result.rows[0];
        res.download(file.FILE_PATH, file.FILE_LOGIC_NM);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
