const Query = require('./../../config/dbHelper');

function ResultTemp(status, msg, data) {
    return {
        status,
        msg,
        data
    }
}


function getAllSourceCount(callBack) {
    let sql =  `SELECT t4.resource,t2.job,t1.activities,t3.live FROM (SELECT COUNT(*) activities FROM t_activities) t1,(SELECT COUNT(*) job FROM t_job) t2,(SELECT COUNT(*) live FROM t_live) t3,(SELECT COUNT(*) resource FROM t_resource) t4 `;
    Query(sql).then((result)=>{
        callBack(ResultTemp(result.code, '获取数据成功', result.data[0]))
    }).catch((error)=>{
        callBack(ResultTemp(error.code, error.msg,error.data))
    })
}


module.exports = {
  getAllSourceCount
};