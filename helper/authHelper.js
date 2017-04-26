var dbHelper = require('../helper/dbHelper');
var ApiException = require('../libs/core/ApiException');
var apiErrors = require('../assets/api_errors');
var dbNames = require('../assets/dbNames');

var mysql = require('mysql');

// define module
var authHelper = {};
module.exports = authHelper;


/**
 * verify authentication sessionId
 * @param {string} - token
 * @param {function(Error,object)} callback - callback function.
 */

authHelper.verifyAuthToken = function (sessionId, callback) {
    var sqlQuery = 'CALL ?? ( ?);';
    var object = [dbNames.sp.userCheckToken, sessionId];
    sqlQuery = mysql.format(sqlQuery, object);
    dbHelper.executeQueryPromise(sqlQuery).then(function (result) {
        if (result[0].length) {
            return callback(null, result[0][0]);
        }
        else {
            return callback(ApiException.newUnauthorizedError(apiErrors.invalid_auth_token.error_code).addDetails(apiErrors.invalid_auth_token.description));
        }
    }, function (error) {
        callback(error);
    });
};

/**
 * extract detail from session id
 * @param {string} - token
 * @param {function(object)} callback - callback function.
 */

authHelper.searchUserByToken = function (sessionId, callback) {
    var sqlQuery = 'CALL ?? ( ?);';
    var object = [dbNames.sp.userCheckToken, sessionId];
    sqlQuery = mysql.format(sqlQuery, object);
    var detail = {
        'hasObject': false,
        'userDetail': {}
    };
    dbHelper.executeQueryPromise(sqlQuery).then(function (result) {
        if (result[0].length) {
            detail.userDetail = result[0][0];
            detail.hasObject = true;
        }
        return callback(null, detail);
    }, function (error) {
        return callback(error);
    });
};