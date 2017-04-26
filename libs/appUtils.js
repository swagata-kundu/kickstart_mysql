var ApiException = require('../libs/core/ApiException');
var Check = require('../libs/core/Check');
var lodash = require('lodash');
var util = require('util');

// define module
var appUtils = {};
module.exports = appUtils;

/**
 * Evaluate given Check rules and call next middleware.
 * If checks are failing, next middleware is called with an ApiException.
 * @param {Object} rules - Check rules object.
 * @param {function} next - next middleware.
 */
appUtils.validateChecks = function (rules, next) {

    if(!lodash.isPlainObject(rules)){
        throw new Error('rules should be a plain object');
    }

    if(!lodash.isFunction(next)){
        throw new Error('next should be a function');
    }

    var errors = Check.collectErrorMessages(rules);

    if (errors.length > 0) {
        return next(ApiException.newBadRequestError(null).addDetails(errors));
    } else {
        next();
    }
};

/**
 * Alphanumeric characters string: A-Z,0-9.
 * @type {string}
 */
appUtils.ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Numeric characters string: 0-9.
 * @type {string}
 */
appUtils.NUMERIC = '0123456789';

/**
 * bcrypt iterations to use for hashing.
 * @type {number}
 */
appUtils.HASH_ITERATIONS = 8;

/**
 * maximum and default page size for paginated results.
 * @type {number}
 */
appUtils.MAX_PAGE_LIMIT = 100;

/**
 * Generate a string of given length by randomly selecting characters from given string.
 * @param {String} charString - source string.
 * @param {Number} length - desired output length. Must be > 0;
 * @return {string} generated output string.
 * @see appUtils.NUMERIC
 * @see appUtils.ALPHANUMERIC
 */
appUtils.randomFrom = function (charString, length) {
    if (!lodash.isString(charString) || charString.length < 1) {
        throw new Error('charString should be a non empty String.');
    }

    if (!lodash.isNumber(length) || length < 1) {
        throw new Error('length should be a non zero number.');
    }

    var random = [];
    for (var i = 0; i < length; i++) {
        random.push(charString[lodash.random(0, charString.length - 1)]);
    }

    return random.join('');
};

/**
 * Returns integer form of given database id, or throws error is id cannot be converted to an integer.
 * @param {(Number|String)} id - database id as number or as string.
 * @return {Number} Integer id.
 */
appUtils.ensureId = function (id) {
    id = parseInt(id);

    if (isNaN(id) || !lodash.isNumber(id)) {
        throw new Error('Id should be a number or in number format.');
    } else {
        return id;
    }
};

/**
 * Ensure a proper and valid query results skip value. min is 0.
 * @param {Number} skip - skip value.
 * @return {Number}
 */
appUtils.ensureSkip = function(skip){
    skip = parseInt(skip);
    return lodash.isFinite(skip) ? Math.max(0,skip) : 0;
};

/**
 * Ensure a proper and valid query results limit value. min is 1.
 * @param {Number} limit - limit value.
 * @return {Number}
 */
appUtils.ensureLimit = function(limit){
    limit = parseInt(limit);
    return lodash.isFinite(limit) ? Math.min(appUtils.MAX_PAGE_LIMIT,Math.max(1,limit)) : appUtils.MAX_PAGE_LIMIT;
};
