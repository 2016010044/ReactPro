// 引入类库相关
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');

// 引入session相关的
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const database = require('./config/config').database;
const sessionStore = new MySQLStore({
    host: database.HOST,
    port: database.PORT,
    user: database.USER,
    password: database.PASSWORD,
    database: database.DATABASE
});

// 引入路由相关
const adminRouter = require('./routes/admin');
const liveRouter = require('./routes/live');
const activitiesRouter = require('./routes/activities');
const lifejobRouter = require('./routes/lifejob');
const resourceRouter = require('./routes/resource');
const homeRouter = require('./routes/home');

// 引入全局控制中间件
const authControl = require('./middleWare/authControl');


const app = express();

//  配置模板引擎
app.set('views', path.join(__dirname, 'views'));
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});

// 使用session
app.use(session({
    key: 'itLike',
    secret: 'itLike',//加密字符串
    resave: true, //强制保存session，即使它没有变化
    saveUninitialized: true,//强制将未初始化的session存储。当新建一个session且未设定属性或值时，它就处于未初始化状态。在设定cookie前，这对于登录验证，减轻服务器存储压力，权限控制是有帮助的，默认为true
     cookie: {maxAge: 24 * 3600 * 1000},
   //  cookie: {maxAge: 1000},
    rolling: true, //在每次请求时进行设置cookie，将重置cookie过期时间
    store: sessionStore
}));


// 使用各种默认集成的中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置静态资源文件夹
app.use(express.static(path.join(__dirname, 'public')));

// 使用权限控制中间件
app.use(authControl);

// 使用路由中间件
app.use('/api/auth/admin', adminRouter);
app.use('/api/auth/live', liveRouter);
app.use('/api/auth/activities', activitiesRouter);
app.use('/api/auth/lifejob', lifejobRouter);
app.use('/api/auth/resource', resourceRouter);
app.use('/api/auth/home', homeRouter);

// 页面404处理中间件
app.use(function (req, res, next) {
    next(createError(404));
});

// 全局错误处理中间件
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
