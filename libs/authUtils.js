var ApiException = require('../libs/core/ApiException');
var apiErrors = require('../assets/api_errors');
var authHelper = require('../helper/authHelper');

var lodash = require('lodash');

// define module
var authUtils = {};
module.exports = authUtils;


/**
 * Ensures there is a valid sessionId in request headers or url query params.
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifySessionId = function (req, res, next) {

    //UUID check regular expression
    var exp = new RegExp('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$');

    // get auth_token from header or url query parameter if present
    var authToken = req.get('sessionId') || req.query.sessionId;

    // auth_token must be provided
    if (authToken === null || authToken === undefined) {
        return next(ApiException.newUnauthorizedError(apiErrors.auth_token_required.error_code, null).addDetails(apiErrors.auth_token_required.description));
    }
    // auth_token must be valid format

    if (!exp.test(authToken)) {
        return next(ApiException.newUnauthorizedError(apiErrors.invalid_auth_token.error_code).addDetails(apiErrors.invalid_auth_token.description));
    }
    // find the Auth object for token
    authHelper.verifyAuthToken(authToken, function (err, authenticationDetail) {
        if (err) {
            return next(err);
        } else {
            // save authentication info in request
            authenticationDetail['isAuthenticated'] = true;
            req.auth = authenticationDetail;
            return checkSalesPerson(req, res, next);
        }
    });

};


/**
 * If there is a valid sessionId in request headers or url query params then it will check that
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifySessionIdOptional = function (req, res, next) {

    //UUID check regular expression
    var exp = new RegExp('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$');

    // get auth_token from header or url query parameter if present
    var authToken = req.get('sessionId') || req.query.sessionId;

    // auth_token must be provided
    if (authToken != null && authToken != undefined) {
        if (!exp.test(authToken)) {
            return next();
        }
        // find the Auth object for token
        authHelper.searchUserByToken(authToken, function (err, userDetail) {
            if (userDetail && userDetail.hasObject == true) {
                // save optional info in request
                req.optionalDetail = userDetail.userDetail;
            }
            return next();
        });
    }
    else {
        return next();
    }
};


/**
 * Check businessOwner / lisencee / super admin 
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifyAnyAdmin = function (req, res, next) {
    if (req.auth && req.auth.roleId >= 2) {
        return next();
    }
    else {
        return next(ApiException.newUnauthorizedError(apiErrors.no_resource_access.error_code).addDetails(apiErrors.no_resource_access.description));
    }
};


/**
 * Check lisencee 
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifyLisencee = function (req, res, next) {
    if (req.auth && req.auth.roleId >= 3) {
        return next();
    }
    else {
        return next(ApiException.newUnauthorizedError(apiErrors.no_resource_access.error_code).addDetails(apiErrors.no_resource_access.description));
    }
};

/**
 * Check admin 
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifyAdmin = function (req, res, next) {
    if (req.auth && req.auth.roleId >= 5) {
        return next();
    }
    else {
        return next(ApiException.newUnauthorizedError(apiErrors.no_resource_access.error_code).addDetails(apiErrors.no_resource_access.description));
    }
};

/**
 * Check super admin 
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtils.verifySuperAdmin = function (req, res, next) {
    if (req.auth && req.auth.roleId == 6) {
        return next();
    }
    else {
        return next(ApiException.newUnauthorizedError(apiErrors.no_resource_access.error_code).addDetails(apiErrors.no_resource_access.description));
    }
};

/**
 * Check sales person privilege
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
function checkSalesPerson(req, res, next) {
    if (req.auth && req.auth.roleId == 4) {
        if (lodash.findIndex(_allowedRoutes, { 'method': req.method, 'url': req.originalUrl }) != -1) {
            return next();
        }
        if (req.auth.privilege == 3) {
            return next();
        }
        if (req.auth.privilege == 2 && req.method != 'DELETE') {
            return next();
        }
        if (req.auth.privilege == 1 && req.method != 'DELETE' && req.method != 'PATCH') {
            return next();
        }
        return next(ApiException.newUnauthorizedError(apiErrors.no_resource_access.error_code).addDetails(apiErrors.no_resource_access.description));
    }
    return next();
}

var _allowedRoutes = [
    {
        'method': 'PATCH',
        'url': '/secure/user'
    }
];