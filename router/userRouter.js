var router = require('express').Router();
var upload = require('../libs/multer');
var authUtil = require('../libs/authUtils');


var controllerIndex = require('../controller/index');

router.patch('/', controllerIndex.user.updateProfile);
router.post('/profilepicture', upload.uploadProfilePic, controllerIndex.user.uploadPic);
router.post('/block', authUtil.verifyLisencee, controllerIndex.user.blockUser);
router.post('/public', authUtil.verifyAdmin, controllerIndex.user.endUserListing);
router.put('/public', authUtil.verifyAdmin, controllerIndex.user.createPublicUser);
router.get('/:userId', authUtil.verifyLisencee, controllerIndex.user.userDetail);
router.delete('/', controllerIndex.user.deleteUser);

module.exports = router;