var Check = require('../libs/core/Check');
var appUtils = require('../libs/appUtils');
var responseModel = require('../assets/responseModel');
var awsHelper = require('../helper/awsUploadHelper');


var async = require('async');

//define module

var uploadModel = {};
module.exports = uploadModel;
var _keyNames = ['profilepic'];

/**
 * Use for uploading multiple files 
 * @param {object} - req (express request object)
 * @param {function(Error,object)} callback - callback function.
 */

uploadModel.uploadMultiple = function(req, callback) {
    var rules = {
        userId: Check.that(req.auth.id).isMYSQLId(),
        folder: Check.that([req.body.folder]).isSubsetOf(_keyNames),
        files: Check.that(req.files).isLengthInRange(1, 12)
    };
    var bucketName = '';
    async.series([
        function(cb) {
            appUtils.validateChecks(rules, cb);
        },
        function(cb) {
            domainDetail({ 'params': { 'domainId': req.body.domainId } }, function(err, result) {
                if (err) {
                    return cb(err);
                }
                bucketName = result.data.AWSBucket;

                //Uncomment this after development
                // bucketName = 'devnightout';
                return cb(null, bucketName ? bucketName : 'devnightout1');
            });
        },
        function(cb) {
            var bucketDetail = {
                'folderName': req.body.folder,
                'bucketName': bucketName
            };
            awsHelper.uploadMultiple(req.files, bucketDetail, cb);
        }
    ], function(err, result) {
        if (err) {
            return callback(err);
        }
        var response = new responseModel.arrayResponse();
        response.data = result[2];
        response.count = response.data.length;
        return callback(null, response);
    });
};