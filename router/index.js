var controllerIndex = require('../controller');

var secureRouter = require('./secureRouter');
var authUtil = require('../libs/authUtils');

module.exports = function(app) {
    app.post('/signup/businessowner', controllerIndex.auth.signUpBusinessOwner);
    app.post('/signup', controllerIndex.auth.signUp);
    app.post('/login', controllerIndex.auth.login);
    app.post('/changepassword', authUtil.verifySessionId, controllerIndex.auth.changePassword);
    app.post('/forgetpassword', controllerIndex.auth.forgetPassword);
    app.get('/isemailidexist/:email', controllerIndex.auth.checkEmail);
    app.get('/isusernameexist/:userName', controllerIndex.auth.checkUserName);
};