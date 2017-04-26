var ApiException = require('../libs/core/ApiException');
var api_errors = require('../assets/api_errors');
var dbHelper = require('../helper/dbHelper');
var Check = require('../libs/core/Check');
var appUtils = require('../libs/appUtils');
var responseModel = require('../assets/responseModel');
var responseMessage = require('../assets/responseMessage');
var awsHelper = require('../helper/awsUploadHelper');
var dbNames = require('../assets/dbNames');
var api_events = require('../assets/api_events');
var mailer = require('../notify/mailNotifier');

var md5 = require('md5');
var uuid = require('node-uuid');
var mysql = require('mysql');
var lodash = require('lodash');
var async = require('async');
//define module

var user = {};
module.exports = user;

var _user_role = {
    'public': 1,
    'businessOwner': 2,
    'licensee': 3,
    'salesPerson': 4,
    'juniorAdmin': 5,
    'admin': 6
};

/**
 * Used for creating new public user.
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

user.createPublicUser = function(req, callback) {
    var rules = {
        firstName: Check.that(req.body.firstName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        lastName: Check.that(req.body.lastName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        email: Check.that(req.body.email).isNotEmptyOrBlank().isEmail().isLengthInRange(1, 100),
        password: Check.that(req.body.password).isNotEmptyOrBlank().isLengthInRange(4, 20),
        contactNo: Check.that(req.body.contactNo).isOptional().isNotEmptyOrBlank().isLengthInRange(10, 20)
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        } else {
            var insertData = sanitizeDataForUserTable(req.body);
            var sessionId = insertData.sessionId;
            insertUserData(insertData, _user_role.public, function(err, userIdCreated) {
                if (err) {
                    return callback(err);
                }
                if (!req.body.isInternalCall) {
                    mailer.sendMail(api_events.user_signup.event_code, insertData.email, insertData);
                }
                var response = new responseModel.objectResponse();
                response.data = responseForSuccessfulSignUp(insertData, userIdCreated, _user_role.public);
                response.message = responseMessage.REGISTRATION_SUCCESSFULL;
                return callback(null, response, sessionId);
            });
        }
    });
};



/**
 * use for changing existing user password.
 * @param {object} - req (express request object)
 * @param userId(int)- used for changing other user password 
 * @param oldPassword(string)
 * @param newPassword(string)
 * @param {function(Error,object)} callback - callback function.
 */

user.changePassword = function(req, callback) {

    if (!req.body.userId) {
        changeUsersOwnPassword(req, callback);
    } else if (req.body.userId && req.auth.roleId > 2) {
        changeOtherUserPassword(req, callback);
    } else {
        return callback(ApiException.newBadRequestError(null));
    }

};


/**
 * Use for updating existing user profile 
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

user.editProfile = function(req, callback) {

    if (!req.body.userId) {
        updateUserOwnProfile(req.body, req.auth.id, callback);
    } else if (req.body.userId && req.auth.roleId > 2) {
        var updateUserProfile = require('../models/userModel-admin').updateUserProfile;
        updateUserProfile(req, callback);
    } else {
        return callback(ApiException.newBadRequestError(null));
    }
};


/**
 * Use for uploading profile picture 
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

user.uploadProfilePic = function(req, callback) {
    var rules = {
        userId: Check.that(req.auth.id).isMYSQLId(),
        file: Check.that(req.file).isObjectType()
    };

    var userId = req.auth.id;
    var bucketDetail = {
        'folderName': 'profilepic',
        'bucketName': 'devnightout1'
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        awsHelper.uploadSingle(req.file, bucketDetail).then(function(url) {
            var updateObject = {
                'imgUrl': url
            };
            updateUserOwnProfile(updateObject, userId, callback);
        }, function(error) {
            return callback(error);

        });
    });
};


/**
 * Use for blocking user from login 
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */
user.blockUser = function(req, callback) {
    var rules = {
        userId: Check.that(req.body.userId).isMYSQLId(),
        flag: Check.that(req.body.flag).isBooleanType()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var SQL = 'CALL ?? (?,?)';
        var inserts = [dbNames.sp.blockUser, req.body.userId, req.body.flag];
        SQL = mysql.format(SQL, inserts);
        dbHelper.executeQuery(SQL, function(err, result) {
            if (err) {
                return callback(err);
            }
            if (result.affectedRows == 1) {
                var resopnse = new responseModel.objectResponse();
                resopnse.message = req.body.flag ? responseMessage.USER_BLOCKED : responseMessage.USER_UNBLOCKED;
                return callback(err, resopnse);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        });
    });
};



/**
 * Used for creating new junior admin.
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */
user.createJuniorAdmin = function(req, callback) {
    var rules = {
        firstName: Check.that(req.body.firstName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        lastName: Check.that(req.body.lastName).isNotEmptyOrBlank().isLengthInRange(1, 50),
        email: Check.that(req.body.email).isNotEmptyOrBlank().isEmail().isLengthInRange(1, 100),
        password: Check.that(req.body.password).isNotEmptyOrBlank().isLengthInRange(4, 20),
        userName: Check.that(req.body.userName).isNotEmptyOrBlank().isLengthInRange(1, 100),
        contactNo: Check.that(req.body.contactNo).isOptional().isNotEmptyOrBlank().isLengthInRange(10, 20)
    };
    async.waterfall([
        function(cb) {
            appUtils.validateChecks(rules, function(err) {
                return cb(err);
            });
        },
        function(cb) {
            var insertData = sanitizeDataForUserTable(req.body);
            insertUserData(insertData, _user_role.juniorAdmin, cb);
        }
    ], function(err) {
        if (err)
            return callback(err);

        var response = new responseModel.objectResponse();
        response.message = responseMessage.REGISTRATION_SUCCESSFULL;
        return callback(null, response);
    });

};





/**
 * Remove redundent data in case of failed sign up
 * @param {int} - userId (newly created userId)
 */
user.failedSignUp = function(userId) {
    if (userId) {
        var SQL = 'CALL ?? (?)';
        var inserts = [dbNames.sp.failedSignUp, userId];
        SQL = mysql.format(SQL, inserts);
        dbHelper.executeQuery(SQL, function() {});
    }
};



var addUserRole = function(userId, roleId, callback) {
    var stringQuery = 'INSERT INTO db_user_in_roles SET ?';
    var insertData = {
        'roleId': roleId,
        'userId': userId
    };
    stringQuery = mysql.format(stringQuery, insertData);
    dbHelper.executeQuery(stringQuery, callback);
};


/**
 * Used for inserting data in db_user and db_user_roles table.
 * @param {object} - insertData (insert object)
 * @param {int} - roleId (user role)
 * @param {function(Error,object)} callback - callback function.
 */

var insertUserData = function(insertData, roleId, callback) {
    checkDuplicateRegistratrtion(insertData.email, insertData.userName, function(err, status) {
        if (err) {
            return callback(err);
        }
        if (status) {
            return callback(ApiException.newNotAllowedError(api_errors.already_registered.error_code, null)
                .addDetails(api_errors.already_registered.description));
        }
        var stringQuery = 'INSERT INTO db_users SET ? ';
        stringQuery = mysql.format(stringQuery, insertData);
        dbHelper.executeQuery(stringQuery, function(err, result) {
            if (err) {
                return callback(err);
            }
            var userId = result.insertId;
            addUserRole(result.insertId, roleId, function(err) {
                if (err) {
                    return callback(err);
                }
                return callback(err, userId);
            });

        });
    });
};

/**
 * Create insert object according to table column name from request body
 * @param {object} data 
 */
var sanitizeDataForUserTable = function(data) {
    var insertObject = {};
    insertObject['firstName'] = lodash.capitalize(data.firstName.trim());
    insertObject['lastName'] = lodash.capitalize(data.lastName.trim());
    insertObject['email'] = data.email.trim();
    if (data.contactNo) {
        insertObject['phone'] = data.contactNo.trim();
    }
    insertObject['password'] = md5(data.password.trim());
    if (data.deviceType && data.deviceId) {
        insertObject['deviceType'] = data.deviceType;
        insertObject['deviceId'] = data.deviceId;
    }
    insertObject['userName'] = data.userName ? data.userName.trim() : data.email.trim();
    insertObject['sessionId'] = uuid.v4();
    insertObject['isLive'] = true;
    return insertObject;
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

/**
 * Use for changing user's own password.
 * @param {object} - req (express request object)
 * @param oldPassword(string)
 * @param newPassword(string)
 * @param {function(Error,object)} callback - callback function.
 */

var changeUsersOwnPassword = function(req, callback) {
    var userId = req.auth.id;
    var rules = {
        newPassword: Check.that(req.body.newPassword).isNotEmptyOrBlank().isLengthInRange(4, 20),
        oldPassword: Check.that(req.body.oldPassword).isNotEmptyOrBlank().isLengthInRange(4, 20)
    };
    appUtils.validateChecks(rules, function(err, result) {
        if (err) {
            return callback(err);
        }
        var oldPassword = md5(req.body.oldPassword);
        var newPassword = md5(req.body.newPassword);
        var sqlQuery = 'UPDATE ?? SET  ?? = ?  WHERE ??=? AND ??=?';
        var inserts = ['db_users', 'password', newPassword, 'id', userId, 'password', oldPassword];
        sqlQuery = mysql.format(sqlQuery, inserts);

        dbHelper.executeQueryPromise(sqlQuery).then(function(result) {
            if (result.affectedRows == 1) {
                var response = new responseModel.objectResponse();
                response.message = responseMessage.CHANGE_PASSWORD;
                return callback(null, response);
            }
            return callback(ApiException.newNotAllowedError(api_errors.wrong_oldpassword.error_code, null)
                .addDetails(api_errors.wrong_oldpassword.description));
        }, function(error) {
            return callback(error);
        });
    });
};

/**
 * Use for updating user's own profile.
 * @param data{object} -
 * @param userId(int)- used for changing profile 
 * @param {function(Error,object)} callback - callback function.
 */
var updateUserOwnProfile = function(data, userId, callback) {
    var insertObject = {};
    if (data.firstName) {
        insertObject['firstName'] = lodash.capitalize(data.firstName.trim());
    }
    if (data.lastName) {
        insertObject['lastName'] = lodash.capitalize(data.lastName.trim());

    }
    if (data.contactNo) {
        insertObject['phone'] = data.contactNo.trim();
    }
    if (data.imgUrl) {
        insertObject['imgUrl'] = data.imgUrl.trim();
    }


    if (data.email || data.userName) {
        checkDuplicateRegistratrtion(data.email ? data.email : '', data.userName ? data.userName : '', function(err, status) {
            if (err) {
                return callback(err);
            }
            if (status) {
                return callback(ApiException.newNotAllowedError(api_errors.already_registered.error_code, null)
                    .addDetails(api_errors.already_registered.description));
            }
            if (data.email) {
                insertObject['email'] = data.email;
            }
            if (data.userName) {
                insertObject['userName'] = data.userName;
            }
            updateData(insertObject, userId, callback);
        });
    } else {
        updateData(insertObject, userId, callback);
    }
};

var updateData = function(insertObject, userId, callback) {
    if (!lodash.isEmpty(insertObject)) {
        var stringQuery = 'UPDATE ?? SET ? WHERE ??=? AND ??=?';
        var inserts = ['db_users', insertObject, 'id', userId, 'isDeleted', false];
        stringQuery = mysql.format(stringQuery, inserts);
        dbHelper.executeQueryPromise(stringQuery).then(function(result) {
            if (result.affectedRows == 1) {
                var response = new responseModel.objectResponse();
                response.message = responseMessage.PROFILE_UPDATED;
                if (insertObject.imgUrl) {
                    response.data['imgUrl'] = insertObject.imgUrl;
                }
                return callback(null, response);
            }
            return callback(ApiException.newNotFoundError(null).addDetails(responseMessage.USER_NOT_FOUND));
        }, function(error) {
            return callback(error);
        });
    } else {
        return callback(ApiException.newBadRequestError(null));
    }
};


/**
 * For sending response if user successfully logged in.
 * @param {Object}  - userDetail(object).
 */
var responseForSuccessfulSignUp = function(userDetail, userId, roleId) {
    var response = {
        'firstName': userDetail.firstName,
        'lastName': userDetail.lastName,
        'email': userDetail.email,
        'contactNo': userDetail.phone,
        'userId': userId,
        'imgUrl': userDetail.imgUrl ? userDetail.imgUrl : '',
        'roleId': roleId
    };
    return response;
};

/**
 * Use for changing other users password.
 * @param {object} - req (express request object)
 * @param userId(int)- used for changing other user password 
 * @param newPassword(string)
 * @param {function(Error,object)} callback - callback function.
 */

var changeOtherUserPassword = function(req, callback) {
    var rules = {
        newPassword: Check.that(req.body.newPassword).isNotEmptyOrBlank().isLengthInRange(4, 20),
        userId: Check.that(req.body.userId).isInteger()
    };
    appUtils.validateChecks(rules, function(err) {
        if (err) {
            return callback(err);
        }
        var newPassword = md5(req.body.newPassword);
        var sqlQuery = 'UPDATE ?? SET  ?? = ?  WHERE ??=? AND ??=?';
        var inserts = ['db_users', 'password', newPassword, 'id', req.body.userId, 'isDeleted', false];
        sqlQuery = mysql.format(sqlQuery, inserts);

        dbHelper.executeQueryPromise(sqlQuery).then(function(result) {
            if (result.affectedRows == 1) {
                var response = new responseModel.objectResponse();
                response.message = responseMessage.CHANGE_PASSWORD;
                return callback(null, response);
            }
            return callback(ApiException.newNotAllowedError(api_errors.wrong_oldpassword.error_code, null)
                .addDetails(api_errors.wrong_oldpassword.description));
        }, function(error) {
            return callback(error);
        });
    });
};