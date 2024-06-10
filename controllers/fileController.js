const path = require('path');
const fs = require('fs');
const db = require('../db');

// Function to upload a file and save its information to the database
exports.uploadFile = async (req, res) => {
    const file = req.file;
    if (!file) {
        throw new Error('No file uploaded');
    }

    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, file.originalname);

    // Save the file to the local disk
    fs.writeFileSync(filePath, file.buffer);

    // Save file information to the database
    const FILE_NO = await getNextFileNo();

    const query = `
        INSERT INTO TB_FILE (FILE_NO, FILE_NAME, FILE_PATH)
        VALUES (:FILE_NO, :FILE_NAME, :FILE_PATH)
    `;
    const binds = {
        FILE_NO,
        FILE_NAME: file.originalname,
        FILE_PATH: filePath
    };

    try {
        await db.execute(query, binds);
        console.log('File uploaded and database record created:', binds);
    } catch (error) {
        console.error('Error inserting file record into database:', error);
        throw new Error('Error inserting file record into database');
    }

    return FILE_NO;
};

// Function to get the next file number from the sequence
async function getNextFileNo() {
    const result = await db.execute('SELECT TB_FILE_NO_SEQ.NEXTVAL AS FILE_NO FROM DUAL');
    return result.rows[0].FILE_NO;
}

// Function to get the file count based on file number
exports.getFileCount = async (req, res) => {
    const { fileNo } = req.query;

    try {
        const result = await db.execute(`
            SELECT COUNT(*) AS FILE_COUNT
            FROM TB_FILE
            WHERE FILE_NO = :FILE_NO
        `, { FILE_NO: fileNo });

        res.json({ count: result.rows[0].FILE_COUNT });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to get files by goods number
exports.getFilesByGoodsNo = async (req, res) => {
    const { goodsNo } = req.query;

    try {
        const result = await db.execute(`
            SELECT FILE_NO, FILE_NAME, FILE_PATH
              FROM TB_FILE
             WHERE FILE_NO = (SELECT FILE_NO FROM GOODS WHERE GOODS_NO = :GOODS_NO)
        `, { GOODS_NO: goodsNo });

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
