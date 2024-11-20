const path = require('path');
const db = require('../db');
const fs = require('fs'); // 파일 시스템 모듈

exports.getNextFileNo = async () => {
    const result = await db.execute('SELECT FILE_NO_SEQ.NEXTVAL AS FILE_NO FROM DUAL');
    return result.rows[0].FILE_NO;
}

exports.uploadFile = async (req, res, fileNo) => {
    const files = req.files;
    if (!files || files.length === 0) {
        throw new Error('No files uploaded');
    }

    try {
        let tmpFileSn = 1;

        if(fileNo == null){
            fileNo = await exports.getNextFileNo();
        }else{
            const maxFileSn = await db.execute(`
                SELECT MAX(FILE_SN) AS MAX_FILE_SN
                FROM FILE_DTL
                WHERE FILE_NO = :fileNo
            `, { fileNo: fileNo });

            if(maxFileSn.rows.length > 0){
                tmpFileSn = maxFileSn.rows[0].MAX_FILE_SN;
            }
        }

        const fileInserts = [];

        files.forEach((file, index) => {
            const filePath = path.join(__dirname, '../uploads', file.filename);
            fileInserts.push({
                FILE_NO: fileNo,
                FILE_SN: tmpFileSn + index + 1,
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

        for (const bind of fileInserts) {
            await db.execute(query, bind);
        }
        console.log('Files uploaded and database records created');
        return fileNo;
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

exports.deleteFile = async (req, res) => {
    const { fileNo, fileSn } = req.params; // 변경된 부분

    try {
        // 데이터베이스에서 파일 정보 가져오기
        const result = await db.execute(`
            SELECT FILE_PATH
            FROM FILE_DTL
            WHERE FILE_NO = :FILE_NO AND FILE_SN = :FILE_SN
        `, { FILE_NO: fileNo, FILE_SN: fileSn });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = result.rows[0].FILE_PATH;

        // 데이터베이스에서 파일 레코드 삭제
        const deleteResult = await db.execute(`
            DELETE FROM FILE_DTL
            WHERE FILE_NO = :FILE_NO AND FILE_SN = :FILE_SN
        `, { FILE_NO: fileNo, FILE_SN: fileSn });

        if (deleteResult.rowsAffected === 0) {
            return res.status(500).json({ error: 'Failed to delete file from database' });
        }

        // 물리적으로 파일 삭제
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file from file system:', err);
                return res.status(500).json({ error: 'Failed to delete file from file system' });
            }

            res.json({ message: 'File deleted successfully' });
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: error.message });
    }
};
