const express = require('express');
const router = express.Router();
const Query = require('./../config/dbHelper');
const {home_img_up} = require('../controller/managerApi/uploadFile');

const homeController = require('./../controller/managerApi/homeController');

/*
 SELECT t1.activities,t2.job,t3.live,t4.resource FROM
	(SELECT COUNT(*) activities FROM t_activities) t1,
	(SELECT COUNT(*) job FROM t_job) t2,
	(SELECT COUNT(*) live FROM t_live) t3,
	(SELECT COUNT(*) resource FROM t_resource) t4
*/
router.get('/source_count', (req, res, next)=>{
    // 1. 查询数据库
   /* let sql =  `SELECT t4.resource,t2.job,t1.activities,t3.live FROM (SELECT COUNT(*) activities FROM t_activities) t1,(SELECT COUNT(*) job FROM t_job) t2,(SELECT COUNT(*) live FROM t_live) t3,(SELECT COUNT(*) resource FROM t_resource) t4 `;
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            msg: '获取数据成功!',
            data: result.data[0]
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '获取数据失败!',
            data: error.data
        })
    })*/
    homeController.getAllSourceCount((result)=>{
        res.json(result);
    });
});

router.get('/buy_count', (req, res, next)=>{
    // 1. 查询数据库
    let sql =  `SELECT t4.resource,t2.job,t1.activities,t3.live FROM (SELECT SUM(t_activities.buy_count) activities FROM t_activities) t1,(SELECT SUM(t_job.buy_count) job FROM t_job) t2,(SELECT SUM(t_live.buy_count) live FROM t_live) t3,(SELECT SUM(t_resource.buy_count) resource FROM t_resource) t4 `;
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            msg: '获取数据成功!',
            data: result.data[0]
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '获取数据失败!',
            data: error.data
        })
    })
});

// 上传直播封面图和焦点图
router.post('/upload_home', home_img_up.single('site_job_img'), (req, res, next)=>{
    res.json({
        status: 1,
        msg: '图片上传成功',
        data: {
            name: '/uploads/images/home/' + req.file.filename
        }
    })
});

// 获取网站的配置信息
router.get('/msg', (req, res, next)=>{
    let sql = `SELECT * FROM t_home_message WHERE id = 1;`;
    // 执行SQL
    Query(sql).then((result)=>{
        res.json({
            status: result.code,
            msg: '获取网站配置信息成功!',
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '获取网站配置信息失败!',
            data: error.data
        })
    })
});



// 修改网站的配置信息
/*
  UPDATE `likeedu`.`t_home_message` SET `id`='1', `site_name`=NULL, `site_keyword`=NULL, `site_des`=NULL, `site_job`=NULL, `site_copy`=NULL, `site_bei`=NULL WHERE (`id`='1');

*/
router.post('/edit', (req, res, next)=>{
    const {token, site_name, site_keyword, site_des, site_logo, site_copy, site_bei} = req.body;
    console.log(req.body);
    if(req.session.token !== token){
        res.json({
            status: 0,
            msg: '非法用户!'
        });
    }else {
        const sql = `UPDATE t_home_message SET site_name=?, site_keyword=?, site_des=?, site_logo=?, site_copy=?, site_bei=? WHERE id = 1;`;
        const value = [ site_name, site_keyword, site_des, site_logo, site_copy, site_bei];
        Query(sql, value).then((result)=>{
            console.log(result);
            res.json({
                status: result.code,
                msg: '修改网站配置成功!!',
                data: {}
            })
        }).catch((error)=>{
            console.log(error);
            res.json({
                status: error.code,
                msg: '修改网站配置失败!',
                data: error.data
            })
        })
    }
});



module.exports = router;