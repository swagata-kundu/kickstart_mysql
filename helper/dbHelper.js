var db = require('../libs/mysql_db');
var ApiException = require('../libs/core/ApiException');

var mysql = require('mysql');

// define module

var dbHelper = {};
module.exports = dbHelper;

/**
 * Execute mysql query 
 * @param {query} - sqlQuery
 * @param {function(Error,object)} callback - callback function.
 */

dbHelper.executeQuery = function (sqlQuery, callback) {
    db.getConnection(function (err, connection) {
        if (err) {
            return callback(err);
        }
        connection.query(sqlQuery, function (err, result) {
            connection.release();
            if (err) {
                return callback(ApiException.newInternalError(err));
            }
            return callback(err, result);
        });
    });
};


/**
 * Execute mysql query 
 * @param {query} - sqlQuery
 * returns promise 
 */


dbHelper.executeQueryPromise = function (sqlQuery) {
    return new Promise(function (resolve, reject) {
        db.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlQuery, function (err, result) {
                    connection.release();
                    if (err) {
                        reject(ApiException.newInternalError(err));
                    }
                    resolve(result);
                });
            }
        });
    });
};


/**
 * Change table flags according to updateObject 
 * @param {object} - updateObject
 * @param {function(Error,object)} callback - callback function.
 */

dbHelper.changeTableFlag = function (updateObject, callback) {
    var stringQuery = 'UPDATE ?? SET ??=? WHERE ??=? AND ??=? AND ??<>?';
    var queryObject = [updateObject.tableName, updateObject.fieldName,
        updateObject.value, 'id', updateObject.id, 'isDeleted', false, updateObject.fieldName,
        updateObject.value];
    stringQuery = mysql.format(stringQuery, queryObject);

    dbHelper.executeQuery(stringQuery, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result.affectedRows);
    });
};