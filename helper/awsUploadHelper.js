var config = require('config');
var ApiException = require('../libs/core/ApiException');
var logger = require('../libs/logger');
var AWS = require('aws-sdk');
var fs = require('fs');
var lodash = require('lodash');
//define modules
var AWSHelper = {};
module.exports = AWSHelper;

var awsConfig = config.get('aws');

//update aws setting
AWS.config.update(awsConfig.key);

/**
 * Upload a single file in aws
 * @param {file} file -file to upload,
 * @param {bucketDetail} AWS location information.
 */
AWSHelper.uploadSingle = function(file, bucketDetail) {
    return new Promise(function(resolve, reject) {
        var fileToUpload = fs.createReadStream(file.path);
        fileToUpload.on('error', function(err) {
            reject(ApiException.newInternalError(err.message).addDetails('Upload did not complete.'));
        });
        var key = bucketDetail.folderName + '/' + file.filename;
        var s3 = new AWS.S3();
        s3.upload({
            Bucket: bucketDetail.bucketName,
            Key: key,
            Body: fileToUpload,
            ACL: 'public-read'
        }).send(function(err, data) {
            deleteFile(file.path);
            if (err) {
                reject(ApiException.newInternalError(err.message).addDetails('Upload did not complete.'));
            } else {
                resolve(data.Location);
            }
        });
    });
};


/**
 * Upload multiple files in aws
 * @param {array} files -files to upload,
 * @param {bucketDetail} AWS location information.
 * @param {function(Error,object)} callback - callback function.
 */

AWSHelper.uploadMultiple = function(files, bucketDetail, callback) {
    var promiseArray = [];
    for (var index in files) {
        promiseArray.push(AWSHelper.uploadSingle(files[index], bucketDetail));
    }
    Promise.all(promiseArray).then(function(urls) {
        return callback(null, urls);
    }, function(error) {
        return callback(error);
    });

};

/**
 * List images in stock stock folder in aws
 * @param {function(Error,object)} callback - callback function.
 */
AWSHelper.stockPhotos = function(callback) {
    var s3 = new AWS.S3();
    var params = {
        Bucket: 'devnightout1',
        Prefix: 'static',
        EncodingType: 'url'

    };
    s3.listObjectsV2(params, function(err, data) {
        if (err) {
            return callback(ApiException.newInternalError(err));
        }
        var images = [];
        images = !data.Contents ? [] : data.Contents.map(function(object) {
            return 'https://s3.amazonaws.com/devnightout1/' + object.Key;
        });
        lodash.pullAt(images, [0]);
        return callback(err, images);
    });
};

/**
 * Create bucket at the aws S3
 * @param {stting} bucketName -name of the bucket,
 * @param {function(Error,object)} callback - callback function.
 */

AWSHelper.createAWSBucket = function(bucketName, callback) {
    var s3 = new AWS.S3();
    s3.createBucket({ Bucket: bucketName, ACL: 'public-read-write' }, callback);
};

/**
 * Delete file after uploading to AWS 
 * @param {string} pathToFile - path of file to delete.
 */
var deleteFile = function(pathToFile) {
    fs.unlink(pathToFile, function(err) {
        if (err) {
            logger.info(err.message);
        }
    });
};