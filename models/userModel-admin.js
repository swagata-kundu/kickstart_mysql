var ApiException = require('../libs/core/ApiException');
var dbHelper = require('../helper/dbHelper');
var Check = require('../libs/core/Check');
var appUtils = require('../libs/appUtils');
var responseModel = require('../assets/responseModel');
var responseMessage = require('../assets/responseMessage');
var dbNames = require('../assets/dbNames');
var pagingHelper = require('../helper/paginationHelper');
var api_errors = require('../assets/api_errors');

var mysql = require('mysql');
var async = require('async');
var lodash = require('lodash');

var userModel_licensee = {};
module.exports = userModel_licensee;

/**
 * Junior admin listing for admin
 * @param {object} req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

userModel_licensee.juniorAdminListing = function(req, callback) {
    var rules = {
        searchText: Check.that(req.body.searchText).isOptional().isLengthInRange(0, 20),
        pageNo: Check.that(req.body.pageNo).isOptional().isInteger(),
        pageSize: Check.that(req.body.pageSize).isOptional().isInteger(),
        sortBy: Check.that(req.body.sortBy).isOptional().isNotEmptyOrBlank(),
        sortOrder: Check.that(req.body.sortOrder).isOptional().isNotEmptyOrBlank()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var pageInfo = pagingHelper.makePageObject(req.body);
        var sql = 'CALL ?? ( ?,?,?,?,?)';
        var parameters = [
            dbNames.sp.juniorAdminListing,
            req.body.searchText ? req.body.searchText.trim() : '',
            pageInfo.skip, pageInfo.limit,
            req.body.sortBy ? req.body.sortBy : '',
            req.body.sortOrder ? req.body.sortOrder : ''
        ];
        sql = mysql.format(sql, parameters);
        dbHelper.executeQuery(sql, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result[1].length) {
                var response = new responseModel.arrayResponse();
                response.data = result[1];
                response.count = result[0][0].totalRecords;
                return callback(err, response);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        });
    });
};



/**
 * End user listing for admin
 * @param {object} req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

userModel_licensee.endUserListing = function(req, callback) {
    var rules = {
        searchText: Check.that(req.body.searchText).isOptional().isLengthInRange(0, 20),
        fromDate: Check.that(req.body.fromDate).isOptional().isDate(),
        toDate: Check.that(req.body.toDate).isOptional().isDate(),
        pageNo: Check.that(req.body.pageNo).isOptional().isInteger(),
        pageSize: Check.that(req.body.pageSize).isOptional().isInteger(),
        sortBy: Check.that(req.body.sortBy).isOptional().isNotEmptyOrBlank(),
        sortOrder: Check.that(req.body.sortOrder).isOptional().isNotEmptyOrBlank()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var pageInfo = pagingHelper.makePageObject(req.body);
        var sql = 'CALL ?? ( ?,?,?,?,?,?,?)';
        var parameters = [
            dbNames.sp.endUserListingAdmin,
            req.body.searchText ? req.body.searchText.trim() : '',
            req.body.fromDate ? new Date(req.body.fromDate) : null,
            req.body.toDate ? new Date(req.body.toDate) : null,
            pageInfo.skip, pageInfo.limit,
            req.body.sortBy ? req.body.sortBy : '',
            req.body.sortOrder ? req.body.sortOrder : ''
        ];
        sql = mysql.format(sql, parameters);
        dbHelper.executeQuery(sql, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result[1].length) {
                var response = new responseModel.arrayResponse();
                response.data = result[1];
                response.count = result[0][0].totalRecords;
                return callback(err, response);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        });
    });
};
/**
 * Junior admin listing for admin
 * @param {object} req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

userModel_licensee.userDetail = function(req, callback) {
    var rules = {
        userId: Check.that(req.params.userId).isMYSQLId()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var sql = 'CALL ?? ( ?)';
        var parameters = [dbNames.sp.userDetail, req.params.userId];
        sql = mysql.format(sql, parameters);
        dbHelper.executeQuery(sql, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result[0].length) {
                var response = new responseModel.objectResponse();
                response.data = result[0][0];
                return callback(err, response);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        });
    });
};


/**
 * Junior admin listing for admin
 * @param {object} req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

userModel_licensee.updateUserProfile = function(req, callback) {
    async.series([
        function(cb) {
            validateUserObject(req, cb);
        },
        function(cb) {
            if (req.body.email || req.body.userName) {
                checkDuplicateRegistratrtion(req.body.email ? req.body.email : '',
                    req.body.userName ? req.body.userName : '',
                    function(err, status) {
                        if (err) {
                            return cb(err);
                        }
                        if (status) {
                            return cb(ApiException.newNotAllowedError(api_errors.already_registered.error_code, null)
                                .addDetails(api_errors.already_registered.description));
                        }
                        return cb(null);
                    });
            } else {
                return cb(null);
            }
        },
        function(cb) {
            updateProfileData(req.body, req.body.userId, cb);
        }
    ], function(err, result) {
        return callback(err, err ? null : result[2]);
    });
};



/**
 * Delete user
 * @param {object} req -express request object
 * @param {function(Error,object)} callback - callback function.
 */
userModel_licensee.deleteUser = function(req, callback) {
    var rules = {
        userId: Check.that(req.body.userId).isInteger()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var stringQuery = 'CALL ?? ( ?)';
        var parameters = [
            dbNames.sp.deleteUser,
            req.body.userId
        ];
        stringQuery = mysql.format(stringQuery, parameters);
        dbHelper.executeQuery(stringQuery, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result[0][0].affectedRow > 0) {
                var response = new responseModel.objectResponse();
                response.message = responseMessage.USER_DELETED;
                return callback(null, response);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        });
    });
};





var validateUserObject = function(req, callback) {
    var rules = {
        userId: Check.that(req.body.userId).isInteger(),
        firstName: Check.that(req.body.firstName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        lastName: Check.that(req.body.lastName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        contactNo: Check.that(req.body.contactNo).isOptional().isNotEmptyOrBlank().isLengthInRange(10, 20),
        roleId: Check.that(req.body.roleId).isInteger().isNumberInRange(1, 5)
    };
    if (req.body.roleId == 4) {
        rules['privilage'] = Check.that(req.body.privilage).isInteger().isNumberInRange(1, 3);
        rules['domainId'] = Check.that(req.body.domainId).isInteger();
    }
    appUtils.validateChecks(rules, callback);
};


/**
 * Use for updating other user's profile.
 * @param data{object} -
 * @param userId(int)- 
 * @param {function(Error,object)} callback - callback function.
 */
var updateProfileData = function(data, userId, callback) {
    var insertObject = {};
    insertObject['firstName'] = lodash.capitalize(data.firstName.trim());
    insertObject['lastName'] = lodash.capitalize(data.lastName.trim());
    insertObject['phone'] = data.contactNo ? data.contactNo : '';
    if (data.imgUrl) {
        insertObject['imgUrl'] = data.imgUrl;
    }
    if (data.email) {
        insertObject['email'] = data.email;
    }
    if (data.userName) {
        insertObject['userName'] = data.userName;
    }
    var stringQuery = 'UPDATE ?? SET ? WHERE ??=? AND ??=?';
    var inserts = ['db_users', insertObject, 'id', userId, 'isDeleted', false];
    stringQuery = mysql.format(stringQuery, inserts);
    dbHelper.executeQueryPromise(stringQuery).then(function(result) {
        if (result.affectedRows == 1) {
            var response = new responseModel.objectResponse();
            response.message = responseMessage.PROFILE_UPDATED;

            return callback(null, response);
        }
        return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
    }, function(error) {
        return callback(error);
    });
};



/**
 * Check existance of email id in db_users table
 * @param {string} emailId 
 * @param {function(Error,object)} callback - callback function
 */
var checkDuplicateRegistratrtion = function(emailId, userName, callback) {
    var sql = 'CALL ?? ( ?,?);';
    var object = [dbNames.sp.checkDuplicateRegistration, emailId, userName];
    sql = mysql.format(sql, object);
    dbHelper.executeQuery(sql, function(err, result) {
        if (err) {
            return callback(err);
        }
        if (result[0][0].count > 0) {
            return callback(null, true);
        }
        return callback(null, false);
    });
};