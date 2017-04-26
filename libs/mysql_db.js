
var mysql = require('mysql');
var ApiException = require('../libs/core/ApiException');

var config = require('config');

module.exports = {
    connectionPool: null,
    connect: function () {
        var pool = mysql.createPool(config.get('db'));
        this.connectionPool = pool;
    },
    getConnection: function (callback) {
        if (!this.connectionPool) {
            return callback(ApiException.newInternalError(null).addDetails('Error in database connection'));
        }
        else {
            this.connectionPool.getConnection(function (err, connection) {
                if (err) {
                    return callback(ApiException.newInternalError(err).addDetails('Error in database connection'));
                }
                return callback(err, connection);
            });
        }
    }
};

