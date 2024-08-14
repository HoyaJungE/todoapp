const db = require('../db');

async function getMembers(req, res) {
    try {
        const result = await db.execute(`
            SELECT
                MEMBER_NO,
                MEMBER_ID,
                MEMBER_PASSWD,
                MEMBER_NAME,
                MEMBER_BIRTH,
                MEMBER_EMAIL,
                MEMBER_PHONE,
                MEMBER_ZIPCODE,
                MEMBER_ADDR1,
                MEMBER_ADDR2,
                MEMBER_DATE,
                MEMBER_GRADE,
                MEMBER_TOTAL,
                MEMBER_LOG,
                MEMBER_DELETE,
                SMS_AGREE,
                EMAIL_AGREE
            FROM MEMBER
            ORDER BY MEMBER_NO
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    getMembers
};
