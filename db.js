const oracledb = require('oracledb');

const dbConfig = {
    user: 'shopping',
    password: '1234',
    connectString: 'localhost:1521/xe'
};

oracledb.initOracleClient({ libDir: 'C:\\instantclient_19_23' }); // Oracle Instant Client 경로 설정

async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Failed to create connection pool', err);
        process.exit(1);
    }
}

async function close() {
    try {
        await oracledb.getPool().close(10);
        console.log('Connection pool closed');
    } catch (err) {
        console.error('Failed to close connection pool', err);
    }
}

// 실제 실행되는 쿼리문을 생성하는 함수 (디버깅용)
function buildSql(sql, binds) {
    let resultSql = sql;
    for (const key in binds) {
        const value = binds[key];
        resultSql = resultSql.replace(new RegExp(`:${key}`, 'g'), `'${value}'`);
    }
    return resultSql;
}

async function execute(query, binds = [], options = {}) {
    let connection;
    options.outFormat = oracledb.OUT_FORMAT_OBJECT;

    try {
        connection = await oracledb.getConnection();
        const finalSql = buildSql(query, binds);
        console.log('Executing SQL (for debug):', finalSql); // 디버깅용 로그
        const result = await connection.execute(query, binds, options); // 실제 실행
        if (query.trim().startsWith('INSERT') || query.trim().startsWith('UPDATE') || query.trim().startsWith('DELETE')) {
            await connection.commit();
        }
        console.log('Rows affected:', result.rowsAffected);
        return result;
    } catch (err) {
        console.error('Database execution error', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Failed to close connection', err);
            }
        }
    }
}

module.exports = {
    initialize,
    close,
    execute
};
