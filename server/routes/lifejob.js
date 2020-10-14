const express = require('express');
const router = express.Router();

const {life_job_img_up} = require('../controller/managerApi/uploadFile');
const Query = require('./../config/dbHelper');


// 上传直播封面图和焦点图
router.post('/upload_life_job', life_job_img_up.single('job_img'), (req, res, next)=>{
    res.json({
        status: 1,
        msg: '图片上传成功',
        data: {
            name: '/uploads/images/lifejob/' + req.file.filename
        }
    })
});

// 获取学前所属分类
router.get('/job_pre', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_pre;`;
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            data: error.data
        })
    })
});

// 获取所属家园
router.get('/job_family', (req, res, next)=>{
    const sql = `SELECT * FROM t_job_family;`;
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            data: error.data
        })
    })
});

// 添加一个人生
router.post('/add', (req, res, next)=>{
    const {token, job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img} = req.body;
    if(req.session.token !== token){
        res.json({
            status: 0,
            msg: '非法用户!'
        });
    }else {
        const sql = `INSERT INTO t_job (job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img) VALUES (?,?,?,?,?,?,?,?);`;
        const value = [job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img];
        Query(sql, value).then((result)=>{
            res.json({
                status: result.code,
                msg: '新增人生成功!',
                data: {}
            })
        }).catch((error)=>{
            res.json({
                status: error.code,
                data: error.data
            })
        })
    }
});

// 获取直播课程列表
router.get('/list', (req, res, next)=>{
    // 1. 获取页码和页数
    let pageNum = req.query.page_num || 1;
    let pageSize = req.query.page_size || 4;

    let sql1 = `SELECT COUNT(*) as job_count FROM t_job;`;
    let sql2 = `SELECT * FROM t_job limit ${(pageNum - 1)*pageSize}, ${pageSize}`;

    // 执行SQL
    Query(sql1).then((result1)=>{
        Query(sql2).then((result)=>{
            res.json({
                status: result.code,
                msg: '获取人生列表成功!',
                data: {
                    job_count: result1.data[0].job_count,
                    job_list: result.data
                }
            })
        }).catch((error)=>{
            res.json({
                status: error.code,
                msg: '获取人生列表失败!',
                data: error.data
            })
        })
    })
});

// 设置是否轮播图
router.get('/set_focus_job', (req, res, next)=>{
    let id = req.query.id;
    let isFocus = Number(req.query.is_focus) || 0;

    let sql = `UPDATE t_job SET is_focus = ? WHERE id = ?`;
    let value = [isFocus, id];

    // 执行SQL
    Query(sql, value).then((result)=>{
        res.json({
            status: result.code,
            msg: '更新成功!',
            data: {}
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '更新失败!',
            data: error.data
        })
    })
});

// 删除一个活动
router.get('/delete_job', (req, res, next)=>{
    let id = req.query.id;
    let sql = `DELETE FROM t_job WHERE id=?`;
    // 执行SQL
    Query(sql, [id]).then((result)=>{
        res.json({
            status: result.code,
            msg: '删除成功!',
            data: {}
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '删除失败!',
            data: error.data
        })
    })
});

// 修改一个活动
router.post('/edit', (req, res, next)=>{
    const {token, job_id, job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img } = req.body;
    console.log(req.body);
    if(req.session.token !== token){
        res.json({
            status: 0,
            msg: '非法用户!'
        });
    }else {
        const sql = `UPDATE t_job SET job_name=?, job_img=?, job_author=?, job_publish_time=?, job_content=?, job_pre_edu_id=?, job_family_edu_id=?, focus_img=? WHERE id = ?;`;
        const value = [ job_name, job_img, job_author, job_publish_time, job_content, job_pre_edu_id, job_family_edu_id, focus_img,  job_id];
        Query(sql, value).then((result)=>{
            console.log(result);
            res.json({
                status: result.code,
                msg: '修改人生成功!',
                data: {}
            })
        }).catch((error)=>{
            console.log(error);
            res.json({
                status: error.code,
                msg: '修改人生失败!',
                data: error.data
            })
        })
    }
});


module.exports = router;