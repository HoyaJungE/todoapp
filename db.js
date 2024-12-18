const oracledb = require('oracledb');

const dbConfig = {
    user: 'shopping',
    password: '1234',
    connectString: 'localhost:1521/xe'
};

/*
const remoteDbConfig = {
    user: 'ADMIN',
    password: 'Fkaus125125@@',
    connectString: '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-chuncheon-1.oraclecloud.com))(connect_data=(service_name=g3d831f30bcf966_dfwk1bqn0epmpnqw_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
};
*/

oracledb.initOracleClient({ libDir: 'C:\\instantclient_21_13' }); // Oracle Instant Client 경로 설정 로컬db 사용시

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
        
        // DML 문에 대한 자동 커밋 처리
        if (query.trim().toUpperCase().startsWith('INSERT') || 
            query.trim().toUpperCase().startsWith('UPDATE') || 
            query.trim().toUpperCase().startsWith('DELETE') ||
            query.trim().toUpperCase().startsWith('MERGE')) {  // MERGE 문 추가
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
