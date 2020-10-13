const express = require('express');
const router = express.Router();
// 引入MD5
const md5 = require('blueimp-md5');
// 引入token生成器
const jwt = require('jsonwebtoken');


// 引入数据库查询函数
const Query = require('./../config/dbHelper');
const KEY = require('./../config/config').KEY;
const {admin_up} =require('./../controller/managerApi/uploadImg')

// 注册主管理员的接口
/*
  admin
  admin
*/
router.post('/reg', (req, res, next)=>{
    // 1. 获取参数
    const {account, password} = req.body;
    const md5_password = md5(password, KEY);
    console.log(account, md5_password);

    // 2. 判断
    if(!account || !password){
        res.json({
            status: 0,
            msg: '用户名或密码不能为空!'
        });
    }

    // 3. 插入数据库
    let sql = `INSERT INTO t_admin(account, password) VALUES (?, ?)`;
    let value = [account, md5_password];
    Query(sql, value).then((result)=>{
        res.json({
            status: result.code,
            msg: '注册主管理员账号成功!'
        });
    }).catch((error)=>{
        res.json({
            status: error.code,
            msg: '注册主管理员账号失败!'
        });
    });
});

// 用户名和密码登录
router.post('/login', (req, res, next)=>{
    // 1. 获取数据
    const {account, password} = req.body;
    // 2. 判断
    if(!account || !password){
        res.json({
            status: 0,
            msg: '用户名或密码不能为空!'
        });
    }

    // 3. 查询数据库
    let sql = `SELECT * FROM t_admin WHERE account = ? AND password = ?;`;
    let value = [account, password];
    Query(sql, value).then((result)=>{
        console.log(result);
        if(result.data.length > 0){
            const {id, account, password, account_name, account_icon} = result.data[0];
            //  3.1 生成一个token
            const userData = {id, account, password};
            const token = jwt.sign(userData, KEY);
            console.log(token);
            // console.log(jwt.verify(token, KEY));
            // 3.2  把token存入session
            req.session.token = token;
            // 3.3 给客户端返回数据
            res.json({
                status: 1,
                msg: '登录成功!',
                data: {
                    token,
                    account,
                    account_name,
                    account_icon
                }
            })
        }else {
            res.json({
                status: 0,
                msg: '当前用户不存在!'
            })
        }
    }).catch((error)=>{
        return next(error);
    })

});

//退出登录
router.get('/logout',(req,res,next)=>{
    //方式1
    req.session.cookie.maxAge=0;
    //方式2
    // req.session.destroy();
    res.json({
        status:1,
        msg:'退出登录成功'
    })
});
// 上传管理员头像
router.post('/upload_admin_icon', admin_up.single('admin_avatar'), (req, res, next)=>{
    res.json({
        status: 1,
        msg: '头像上传成功',
        data: {
            name: '/uploads/images/admin/' + req.file.filename
        }
    })
});

//修改用户信息
router.post('/edit', (req, res, next)=>{
    const {token, account_name, account_icon} = req.body;
    // 1. 获取管理员对象
    const userObj = jwt.verify(token, KEY);
    const sql = `UPDATE t_admin SET account_name=?, account_icon=? WHERE id = ?; `;
    const value = [account_name, account_icon, userObj.id];

    // 2. 查询数据库
    Query(sql, value).then((result)=>{
        res.json({
            status: result.code,
            msg: '管理员信息更新成功!',
            data: {
                token,
                account: userObj.account,
                account_name,
                account_icon
            }
        })
    }).catch((error)=>{
        return next(error);
    })
});

// 修改管理员密码
router.post('/reset_pwd', (req, res, next)=>{
    const {token, old_pwd, new_pwd} = req.body;
    // 1. 获取管理员对象
    const userObj = jwt.verify(token, KEY);

    // 2. 判断
    if(userObj.password !== old_pwd){
        res.json({
            status: 0,
            msg: '原始密码不正确!'
        });
    }else {
        const sql = `UPDATE t_admin SET password=? WHERE id = ?; `;
        const value = [new_pwd, userObj.id];
        // 2. 查询数据库
        Query(sql, value).then((result)=>{
            req.session.destroy();
            res.json({
                status: result.code,
                msg: '密码修改成功!'
            })
        }).catch((error)=>{
            return next(error);
        })
    }
});
module.exports = router;