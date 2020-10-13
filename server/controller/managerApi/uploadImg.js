// 添加存储引擎
const multer = require('multer');
const path = require('path');

function createUp(direct_path) {
    let storage = multer.diskStorage({
        // 此处是用于设置文件路径
        destination: function (req, file, cb) {
            cb(null, direct_path);
        },
        // 设置文件名称
        filename: function (req, file, cb) {
            // 1. 获取上传图片的后缀名
            // hello.png --> [hello, png]
            let fileList = file.originalname.split('.');
            let ext = fileList[fileList.length - 1];

            // 2. 不重复
            let times = new Date();
            times = times.getTime();

            // 3. 合并新文件名
            let newName = `${times}.${ext}`;
            cb(null, newName);
        }
    });
    return multer({ storage });
}

const admin_up = createUp(path.join(__dirname, '../../public/uploads/images/admin'));
module.exports = {
    admin_up,
};