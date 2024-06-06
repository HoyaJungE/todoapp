// controllers/menuController.js
const db = require('../db');

// Get all menus
exports.getAllMenus = async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM MENU ORDER BY UPPR_MENU_NO, MENU_NO');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add new menu
exports.addMenu = async (req, res) => {
    const { UPPR_MENU_NO, MENU_URL, MENU_NAME } = req.body;
    try {
        const result = await db.execute(`
            INSERT INTO MENU (MENU_NO, UPPR_MENU_NO, MENU_URL, MENU_NAME, CREATE_DT)
            VALUES (MENU_NO_SEQ.NEXTVAL, :UPPR_MENU_NO, :MENU_URL, :MENU_NAME, SYSDATE)
        `, { UPPR_MENU_NO, MENU_URL, MENU_NAME }, { autoCommit: true });
        res.json({ message: 'Menu added', id: result.lastRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update menu
exports.updateMenu = async (req, res) => {
    const { id } = req.params;
    const { UPPR_MENU_NO, MENU_URL, MENU_NAME } = req.body;
    try {
        await db.execute(`
            UPDATE MENU
            SET UPPR_MENU_NO = :UPPR_MENU_NO, MENU_URL = :MENU_URL, MENU_NAME = :MENU_NAME
            WHERE MENU_NO = :MENU_NO
        `, { UPPR_MENU_NO, MENU_URL, MENU_NAME, MENU_NO: id }, { autoCommit: true });
        res.json({ message: 'Menu updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM MENU WHERE MENU_NO = :MENU_NO', { MENU_NO: id }, { autoCommit: true });
        res.json({ message: 'Menu deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
