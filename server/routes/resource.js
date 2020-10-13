const express = require('express');
const router = express.Router();

const {resource_file_up, resource_img_up} = require('./../controller/managerApi/uploadFile');
const Query = require('./../config/dbHelper');


// 多文件上传
router.post('/upload_many_file', resource_file_up.array('resource_file'), (req, res, next) => {
    console.log(req.files);
    res.json({
        status: 1,
        data: {
            url: '/uploads/resource/' + req.files[0].filename,
            name: req.files[0].originalname,
            uid: req.files[0].filename
        }
    })
});
// 获取所属分类
router.get('/r_category', (req, res, next) => {
    const sql = `SELECT * FROM t_resource_category;`;
    Query(sql).then((result) => {
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error) => {
        res.json({
            status: error.code,
            data: error.data
        })
    })
});
// 获取所属班级
router.get('/r_classes', (req, res, next) => {
    const sql = `SELECT * FROM t_resource_classes;`;
    Query(sql).then((result) => {
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error) => {
        res.json({
            status: error.code,
            data: error.data
        })
    })
});

// 获取所属区域
router.get('/r_area', (req, res, next) => {
    const sql = `SELECT * FROM t_resource_area;`;
    Query(sql).then((result) => {
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error) => {
        res.json({
            status: error.code,
            data: error.data
        })
    })
});

// 获取所属格式
router.get('/r_format', (req, res, next) => {
    const sql = `SELECT * FROM t_resource_format;`;
    Query(sql).then((result) => {
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error) => {
        res.json({
            status: error.code,
            data: error.data
        })
    })
});

// 获取所属分类
router.get('/r_meta', (req, res, next) => {
    const sql = `SELECT * FROM t_resource_meta;`;
    Query(sql).then((result) => {
        res.json({
            status: result.code,
            data: result.data
        })
    }).catch((error) => {
        res.json({
            status: error.code,
            data: error.data
        })
    })
});
// 上传直播封面图和焦点图
router.post('/upload_resource', resource_img_up.single('resource_upload_img'), (req, res, next) => {
    res.json({
        status: 1,
        msg: '图片上传成功',
        data: {
            name: '/uploads/images/resource/' + req.file.filename
        }
    })
});

//添加资源
// 添加资源
router.post('/add', (req, res, next)=>{
    const {token, resource_name, resource_author, resource_publish_time, resource_content, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id, resource_img, resource_price,  focus_img} = req.body;
    console.log(req.body);
    if(req.session.token !== token){
        res.json({
            status: 0,
            msg: '非法用户!'
        });
    }else {
        console.log(resource_content);
        if(resource_content && resource_content.length > 0){
            let fileArr = [];
            let fileTag = new Date().getTime();
            resource_content.forEach(function (n, i) {
                let _arr = [];
                for(let m in n ){
                    _arr.push(n[m]);
                }
                _arr.push(fileTag);
                fileArr.push(_arr);
            });

            console.log(fileArr);

            // 执行插入操作
            let sql = `INSERT INTO t_resource_file(url, name, uid, tag) VALUES ?`;
            Query(sql, [fileArr]).then((result)=>{
                console.log(result);
                const sql1 = `INSERT INTO t_resource(resource_name, resource_author, resource_publish_time, resource_content, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id, resource_img, resource_price,  focus_img) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`;
                const value = [ resource_name, resource_author, resource_publish_time, fileTag, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id, resource_img, resource_price,  focus_img];
                Query(sql1, value).then((result)=>{
                    res.json({
                        status: result.code,
                        msg: '新增资源成功!',
                        data: {}
                    })
                }).catch((error)=>{
                    console.log(error);
                    res.json({
                        status: error.code,
                        data: error.data
                    })
                })
            }).catch((error)=>{
                console.log(error);
                res.json({
                    status: error.code,
                    data: error.data
                })
            })
        }
    }
});
// 获取资源;列表
router.get('/list', (req, res, next)=>{
    // 1. 获取页码和页数
    let pageNum = req.query.page_num || 1;
    let pageSize = req.query.page_size || 4;

    let sql1 = `SELECT COUNT(*) as resource_count FROM t_resource;`;
    let sql2 = `SELECT t_resource.* , t_resource_category.category_name FROM t_resource LEFT JOIN t_resource_category ON t_resource.resource_category_id = t_resource_category.id limit ${(pageNum - 1)*pageSize}, ${pageSize}`;

    // 执行SQL
    Query(sql1).then((result1)=>{
        Query(sql2).then((result)=>{
            res.json({
                status: result.code,
                msg: '获取资源列表成功!',
                data: {
                    resource_count: result1.data[0].resource_count,
                    resource_list: result.data
                }
            })
        }).catch((error)=>{
            res.json({
                status: error.code,
                msg: '获取资源列表失败!',
                data: error.data
            })
        })
    })
});

// 设置是否轮播图
router.get('/set_focus_resource', (req, res, next)=>{
    let id = req.query.id;
    let isFocus = Number(req.query.is_focus) || 0;

    let sql = `UPDATE t_resource SET is_focus = ? WHERE id = ?`;
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

// 删除一个资源
router.get('/delete_resource', (req, res, next)=>{
    let id = req.query.id;
    let sql = `DELETE FROM t_resource WHERE id=?`;
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

// 获取上传的文件
router.get('/file_list', (req, res, next)=>{
    // 1. 获取tag
    let tag = req.query.tag;
    let sql = `SELECT url, name, uid FROM t_resource_file WHERE tag = ?`;

    // 执行SQL
    Query(sql, [tag]).then((result)=>{
        res.json({
            status: result.code,
            msg: '获取文件列表成功!',
            data: result.data
        })
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '获取资源列表失败!',
            data: error.data
        })
    })
});

// 修改一条资源
router.post('/edit', (req, res, next)=> {
    const {token, resource_id, resource_name, resource_author, resource_publish_time, resource_content, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id, resource_img, resource_price, focus_img, resource_content_tag} = req.body;
    console.log(req.body);

    if (req.session.token !== token) {
        res.json({
            status: 0,
            msg: '非法用户!'
        });
    } else {
        // 先删除, 后添加
        if (resource_content && resource_content.length > 0) {
            let sql0 = `delete from t_resource_file where tag=?`;
            Query(sql0, [resource_content_tag]).then((result) => {
                // 删除成功, 添加
                let fileArr = [];
                let fileTag = resource_content_tag;
                resource_content.forEach(function (n, i) {
                    let _arr = [];
                    for (let m in n) {
                        _arr.push(n[m]);
                    }
                    _arr.push(fileTag);
                    fileArr.push(_arr);
                });
                // 插入
                let sql = `INSERT INTO t_resource_file(url, name, uid, tag) VALUES ?`;
                Query(sql, [fileArr]).then((result) => {
                    // 更新资源表
                    const sql = `UPDATE t_resource SET resource_name=?, resource_author=?, resource_publish_time=?, resource_content=?, resource_category_id=?, resource_classes_id=?, resource_area_id=?, resource_meta_id=?, resource_format_id=?, resource_img = ?, resource_price = ?, focus_img = ? WHERE id = ?;`;
                    const value = [resource_name, resource_author, resource_publish_time, resource_content_tag, resource_category_id, resource_classes_id, resource_area_id, resource_meta_id, resource_format_id, resource_img, resource_price, focus_img, resource_id];
                    Query(sql, value).then((result) => {
                        res.json({
                            status: result.code,
                            msg: '修改活动成功!',
                            data: {}
                        })
                    }).catch((error) => {
                        res.json({
                            status: error.code,
                            msg: '修改活动失败!',
                            data: error.data
                        })
                    })

                }).catch((error) => {
                    console.log(error);
                    res.json({
                        status: error.code,
                        data: error.data
                    })
                })


            }).catch((error) => {
                res.json({
                    status: error.code,
                    msg: 'SQL语句出现问题',
                    data: {}
                })
            });
        } else {
            res.json({
                status: 0,
                msg: '上传的资源不能为空!'
            });
        }
    }
});
module.exports = router;