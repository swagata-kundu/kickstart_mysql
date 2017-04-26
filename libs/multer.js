var ApiException = require('../libs/core/ApiException');
var api_errors = require('../assets/api_errors');

var multer = require('multer');

/**
 * Configure multer for uploading file
 * Save location and rename file
 */
var configureMulter = function(fileSizeMb) {
    fileSizeMb = fileSizeMb ? fileSizeMb : 1;
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function(req, file, cb) {
            cb(null, Date.now() + '_' + cleanFilename(file.originalname));
        }
    });
    var upload = multer({
        storage: storage,
        limits: { fileSize: fileSizeMb * 1024 * 1024 }
    });
    return upload;
};


//export modules

var uploader = {};
module.exports = uploader;

/**
 * Middleware for uploading profile picture
 */
uploader.uploadProfilePic = function(req, res, next) {
    var upload = configureMulter(10).single('image');
    handleUploadError(req, res, next, upload);
};

/**
 * Middleware for uploading multiple file
 */
uploader.uploadMany = function(req, res, next) {
    var upload = configureMulter(10).array('files', 12);
    handleUploadError(req, res, next, upload);
};

/**
 * Middleware for uploading profile picture
 */
uploader.uploadContactUs = function(req, res, next) {
    var upload = configureMulter(2).single('file');
    handleUploadError(req, res, next, upload);
};

/**
 * Middleware for uploading .CSV file
 */
uploader.uploadCSV = function(req, res, next) {
    var upload = configureMulter(10).single('csv');
    handleCSVUploadError(req, res, next, upload);

};

/**
 * Handle upload error
 */
function handleUploadError(req, res, next, upload) {
    upload(req, res, function(err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(ApiException.newNotAllowedError(api_errors.file_size_exceeds_limit.error_code, null)
                    .addDetails(api_errors.file_size_exceeds_limit.description));
            } else {
                return next(ApiException.newInternalError(null).addDetails('Error in upload file'));
            }
        }
        return next();
    });
}

/**
 * Handle .CSV upload error
 */
function handleCSVUploadError(req, res, next, upload) {
    upload(req, res, function(err) {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(ApiException.newNotAllowedError(api_errors.file_size_exceeds_limit.error_code, null)
                    .addDetails(api_errors.file_size_exceeds_limit.description));
            } else {
                return next(ApiException.newInternalError(null).addDetails('Error in upload file'));
            }
        }
        return next();
    });
}

function cleanFilename(text) {
    return text.split(' ').join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}