const db = require('../db');

async function getMenus(req, res) {
    try {
        const result = await db.execute(`
            SELECT
                MENU_NO,
                UPPR_MENU_NO,
                MENU_URL,
                MENU_NAME,
                CREATE_DT,
                ORDR,
                MENU_TYPE
            FROM MENU
            START WITH UPPR_MENU_NO IS NULL
            CONNECT BY PRIOR MENU_NO = UPPR_MENU_NO
            ORDER SIBLINGS BY ORDR
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRoleMenus(req, res) {
    const { roleNo } = req.params;
    try {
        const result = await db.execute(`
            SELECT MENU_NO
            FROM ROLE_MENU
            WHERE ROLE_NO = :roleNo
        `, { roleNo });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateRoleMenus(req, res) {
    const { roleNo, menuNos } = req.body;
    
    try {
        await db.execute('DELETE FROM ROLE_MENU WHERE ROLE_NO = :roleNo', { roleNo });

        if (menuNos && menuNos.length > 0) {
            const insertQuery = `
                INSERT INTO ROLE_MENU (
                    ROLE_MENU_NO,
                    ROLE_NO,
                    MENU_NO,
                    CREATE_DT
                ) VALUES (
                    ROLE_MENU_NO_SEQ.NEXTVAL,
                    :roleNo,
                    :menuNo,
                    SYSDATE
                )
            `;

            await Promise.all(menuNos.map(menuNo => 
                db.execute(insertQuery, { roleNo, menuNo })
            ));
        }

        res.json({ message: '메뉴 권한이 업데이트되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMenuById(req, res) {
    const { id } = req.params;
    try {
        const result = await db.execute(`
            SELECT
                MENU_NO,
                UPPR_MENU_NO,
                MENU_URL,
                MENU_NAME,
                CREATE_DT,
                ORDR,
                MENU_TYPE
            FROM MENU
            WHERE MENU_NO = :MENU_NO
        `, { MENU_NO: id });
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Menu not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function addMenu(req, res) {
    const { UPPR_MENU_NO, MENU_URL, MENU_NAME, ORDR, MENU_TYPE } = req.body;
    const query = `
        INSERT INTO MENU (
            MENU_NO,
            UPPR_MENU_NO,
            MENU_URL,
            MENU_NAME,
            CREATE_DT,
            ORDR,
            MENU_TYPE
        ) VALUES (
            MENU_NO_SEQ.NEXTVAL,
            :UPPR_MENU_NO,
            :MENU_URL,
            :MENU_NAME,
            SYSDATE,
            :ORDR,
            :MENU_TYPE
        )
    `;
    const binds = { UPPR_MENU_NO, MENU_URL, MENU_NAME, ORDR, MENU_TYPE };

    try {
        await db.execute(query, binds);
        res.status(201).json({ message: 'Menu added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateMenu(req, res) {
    const { id } = req.params;
    const { UPPR_MENU_NO, MENU_URL, MENU_NAME, ORDR, MENU_TYPE } = req.body;
    const query = `
        UPDATE MENU
        SET
            UPPR_MENU_NO = :UPPR_MENU_NO,
            MENU_URL = :MENU_URL,
            MENU_NAME = :MENU_NAME,
            ORDR = :ORDR,
            MENU_TYPE = :MENU_TYPE
        WHERE MENU_NO = :MENU_NO
    `;
    const binds = { UPPR_MENU_NO, MENU_URL, MENU_NAME, ORDR, MENU_TYPE, MENU_NO: id };

    try {
        await db.execute(query, binds);
        res.json({ message: 'Menu updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteMenu(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM MENU WHERE MENU_NO = :MENU_NO';
    const binds = { MENU_NO: id };

    try {
        await db.execute(query, binds);
        res.json({ message: 'Menu deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMenus,
    getMenuById,
    addMenu,
    updateMenu,
    deleteMenu,
    getRoleMenus,
    updateRoleMenus
};
