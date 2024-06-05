const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET_KEY = 'your_secret_key';

exports.signup = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};
