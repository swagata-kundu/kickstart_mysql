var authModel = require('../models/authModel');
var userModel = require('../models/userModel');


/**
 * Public User signup controller
 * @request_type- POST
 * @url- /signup
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.signUp = function(req, res, next) {
    userModel.createPublicUser(req, function(err, result, sessionId) {
        if (err) {
            return next(err);
        } else {
            res.set('sessionId', sessionId).json(result);
        }
    });
};


/**
 * Business owner signup controller
 * @request_type- POST
 * @url- /signup/businessowner
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.signUpBusinessOwner = function(req, res, next) {
    userModel.createBusinessOwner(req, function(err, result, sessionId) {
        if (err) {
            return next(err);
        } else {
            res.set('sessionId', sessionId).json(result);
        }
    });
};



/**
 * User login controller
 * @request_type- POST
 * @url- /login
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.login = function(req, res, next) {
    authModel.login(req, function(err, result, sessionId) {
        if (err) {
            return next(err);
        } else {
            res.set('sessionId', sessionId).json(result);
        }
    });
};

/**
 * Check Email existance controller
 * @request_type- GET
 * @url- /isemailidexist/:emailId
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.checkEmail = function(req, res, next) {
    authModel.checkEmail(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * Change password controller
 * @request_type- POST
 * @url- /changepassword
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.changePassword = function(req, res, next) {
    userModel.changePassword(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};



/**
 * Forget password controller
 * @request_type- POST
 * @url- /forgetpasssword
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.forgetPassword = function(req, res, next) {
    authModel.forgetPassword(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * Check username existance controller
 * @request_type- GET
 * @url- /isemailidexist/:emailId
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.checkUserName = function(req, res, next) {
    authModel.checkUserName(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};