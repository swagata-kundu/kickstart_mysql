var bodyParser = require('body-parser');
var ApiException = require('./core/ApiException');

/**
 * Wraps "body-parser" middleware, detects parsing errors.
 * @param options body-parser options.
 * @returns {Function} wrapped middleware.
 */
module.exports = function (options) {
    var mw = bodyParser.json(options);

    return function (req, res, next) {

        var handler = function (err) {
            if (err && err.status && err.status === 400) {
                next(ApiException.newBadRequestError(null).addDetails('Error parsing JSON: ' + err.message));
            } else {
                next(err);
            }
        };

        mw(req, res, handler);
    };
};