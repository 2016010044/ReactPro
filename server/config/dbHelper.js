// 1. 引入MySQL
const mySQL = require('mysql');
const dbConfig = require('./config').database;

// 2. 创建数据库连接池
const pool = mySQL.createPool({
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DATABASE
});

// 3. 创建通用查询方法, 可以promise返回
let Query = (sql, value)=>{
    return new Promise((resolve, reject)=>{
         // 3.1 建立连接查询
        pool.getConnection((error, connection)=>{
            // 3.2 连接失败
            if(error){
                reject({code: 0, data: error});
            }
            // 3.3 通过连接去查询数据库
            connection.query(sql, value,  (error, results, fields) =>{
                // 3.4 关闭连接
                connection.release();

                //  3.5 SQL语句执行失败
                if (error) {
                    reject({code: 0, data: error, msg: 'SQL语句执行失败!'});
                }

                // 3.5 返回SQL语句操作完成的结果
                resolve({code: 1, data: results, msg: 'SQL语句执行成功!' });
            });
        });
    });
};

module.exports = Query;