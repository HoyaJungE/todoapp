const db = require('../db');

async function getRoles(req, res) {
    try {
        const result = await db.execute(`
            SELECT
                ROLE_NO,
                UPPR_ROLE_NO,
                ROLE_NM,
                ROLE_CN
            FROM ROLE
            ORDER BY ROLE_NO
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRoleById(req, res) {
    const { id } = req.params;
    try {
        const result = await db.execute(`
            SELECT
                ROLE_NO,
                UPPR_ROLE_NO,
                ROLE_NM,
                ROLE_CN
            FROM ROLE
            WHERE ROLE_NO = :ROLE_NO
        `, { ROLE_NO: id });
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function addRole(req, res) {
    const { UPPR_ROLE_NO, ROLE_NM, ROLE_CN } = req.body;
    const query = `
        INSERT INTO ROLE (
            ROLE_NO,
            UPPR_ROLE_NO,
            ROLE_NM,
            ROLE_CN
        ) VALUES (
            ROLE_NO_SEQ.NEXTVAL,
            :UPPR_ROLE_NO,
            :ROLE_NM,
            :ROLE_CN
        )
    `;
    const binds = { UPPR_ROLE_NO, ROLE_NM, ROLE_CN };

    try {
        await db.execute(query, binds);
        res.status(201).json({ message: 'Role added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateRole(req, res) {
    const { id } = req.params;
    const { UPPR_ROLE_NO, ROLE_NM, ROLE_CN } = req.body;
    const query = `
        UPDATE Role
        SET
            UPPR_ROLE_NO = :UPPR_ROLE_NO,
            ROLE_NM = :ROLE_NM,
            ROLE_CN = :ROLE_CN
        WHERE ROLE_NO = :ROLE_NO
    `;
    const binds = { ROLE_NO: id, UPPR_ROLE_NO, ROLE_NM, ROLE_CN};

    try {
        await db.execute(query, binds);
        res.json({ message: 'Role updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteRole(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM ROLE_NO WHERE ROLE_NO = :Role_NO';
    const binds = { ROLE_NO: id };

    try {
        await db.execute(query, binds);
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getRoles,
    getRoleById,
    addRole,
    updateRole,
    deleteRole
};
