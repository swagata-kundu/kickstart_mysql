var userModel = require('../models/userModel');
var userModel_admin = require('../models/userModel-admin');
/**
 * Update profile controller
 * @request_type- PATCH
 * @url- /secure/user/
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.updateProfile = function(req, res, next) {
    userModel.editProfile(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};
/**
 * Upload profile picture
 * @request_type- POST
 * @url- /secure/user/profilepicture
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.uploadPic = function(req, res, next) {
    userModel.uploadProfilePic(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * Block user from login
 * @request_type- POST
 * @url- /secure/user/block
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.blockUser = function(req, res, next) {
    userModel.blockUser(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * Create junior admin
 * @request_type- PUT
 * @url- /secure/user/junioradmin
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.createJuniorAdmin = function(req, res, next) {
    userModel.createJuniorAdmin(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * User Detail
 * @request_type- GET
 * @url- /secure/user/:userId
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.userDetail = function(req, res, next) {
    userModel_admin.userDetail(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};


/**
 * Delete user for admin
 * @request_type- DELETE
 * @url- /secure/user
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.deleteUser = function(req, res, next) {
    userModel_admin.deleteUser(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};



/**
 * End user listing for admin
 * @request_type- POST
 * @url- /secure/user/public
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.endUserListing = function(req, res, next) {
    userModel_admin.endUserListing(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};

/**
 * Create public user
 * @request_type- PUT
 * @url- /secure/user/public
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function} next - next middleware callback.
 */

exports.createPublicUser = function(req, res, next) {
    userModel.createPublicUserViaAdmin(req, function(err, result) {
        if (err) {
            return next(err);
        } else {
            res.json(result);
        }
    });
};