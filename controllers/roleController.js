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

async function addMemberRole(req, res) {
    const { ROLE_NO, MEMBER_NO } = req.body;
    const query = `
        INSERT INTO MEMBER_ROLE (
            ROLE_NO,
            MEMBER_NO,
            INSRT_DT
        ) VALUES (
            :ROLE_NO,
            :MEMBER_NO,
            SYSDATE
        )
    `;
    const binds = { ROLE_NO, MEMBER_NO };

    try {
        await db.execute(query, binds);
        res.status(201).json({ message: 'MemberRole added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteMemberRole(req, res) {
    const { ROLE_NO, MEMBER_NO } = req.body;
    const query = 'DELETE FROM MEMBER_ROLE WHERE ROLE_NO = :ROLE_NO AND MEMBER_NO = :MEMBER_NO';
    const binds = { ROLE_NO: ROLE_NO, MEMBER_NO: MEMBER_NO };

    try {
        await db.execute(query, binds);
        res.json({ message: 'MemberRole deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRoleMembers(req, res) {
    const { roleNo } = req.query;
    console.log(req.query);
    const query = `
        SELECT B.MEMBER_NO,
               B.MEMBER_ID,
               B.MEMBER_PASSWD,
               B.MEMBER_NAME,
               B.MEMBER_BIRTH,
               B.MEMBER_EMAIL,
               B.MEMBER_PHONE,
               B.MEMBER_ZIPCODE,
               B.MEMBER_ADDR1,
               B.MEMBER_ADDR2,
               B.MEMBER_DATE,
               B.MEMBER_GRADE,
               B.MEMBER_TOTAL,
               B.MEMBER_LOG,
               B.MEMBER_DELETE,
               B.SMS_AGREE,
               B.EMAIL_AGREE
        FROM MEMBER_ROLE A , MEMBER B
        WHERE A.MEMBER_NO = B.MEMBER_NO
          AND A.ROLE_NO = :roleNo
        ORDER BY B.MEMBER_NO
    `;
    const binds = { roleNo: roleNo};
    try {
        const result = await db.execute(query, binds);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function addRoleMenu(req, res) {
    const { ROLE_NO, MENU_NO } = req.body;
    const query = `
        INSERT INTO ROLE_MNEU (
            ROLE_NO,
            MENU_NO,
            INSRT_DT           
        ) VALUES (
            :ROLE_NO,
            :MENU_NO,
            SYSDATE
        )
    `;
    const binds = { ROLE_NO, MENU_NO };

    try {
        await db.execute(query, binds);
        res.status(201).json({ message: 'MemberRole added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteRoleMenu(req, res) {
    const { ROLE_NO, MENU_NO } = req.body;
    const query = 'DELETE FROM ROLE_MNEU WHERE ROLE_NO = :ROLE_NO AND MENU_NO = :MENU_NO';
    const binds = { ROLE_NO: ROLE_NO, MENU_NO: MENU_NO };

    try {
        await db.execute(query, binds);
        res.json({ message: 'MemberRole deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRoleMenus(req, res) {
    const { roleNo } = req.query;
    console.log(req.query);
    const query = `
        SELECT B.MENU_NO,
               B.MENU_NAME,
        FROM ROLE_MENU A , MENU B
        WHERE A.ROLE_NO = B.ROLE_NO
          AND A.ROLE_NO = :roleNo
          AND B.MENU_TYPE = 1
        ORDER BY B.MENU_NO
    `;
    const binds = { roleNo: roleNo};
    try {
        const result = await db.execute(query, binds);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getRoles,
    getRoleById,
    addRole,
    updateRole,
    deleteRole,
    addMemberRole,
    deleteMemberRole,
    getRoleMembers,
    addRoleMenu,
    deleteRoleMenu,
    getRoleMenus
};
