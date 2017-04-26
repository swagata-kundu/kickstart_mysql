var router = require('express').Router();


var userRouter = require('./userRouter');
var authUtil = require('../libs/authUtils');
var upload = require('../libs/multer');
var controllerIndex = require('../controller/index');

router.use(authUtil.verifySessionId);
router.use('/user', userRouter);
router.post('/upload/multiple', upload.uploadMany, controllerIndex.upload.uploadMultiple);


module.exports = router;