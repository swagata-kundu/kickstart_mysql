var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var lodash = require('lodash');

var config = require('config');
var useragent = require('express-useragent');

var logger = require('./libs/logger');
var ErrorHandler = require('./libs/core/ErrorHandler');
var ApiException = require('./libs/core/ApiException');
var jsonBodyParser = require('./libs/jsonBodyParser');


// init environment
var allowedEnv = ['development', 'stage', 'm2', 'production'];
var env = config.util.getEnv('NODE_ENV');
if (lodash.includes(allowedEnv, env)) {
    console.info('NODE_ENV: %s', env);
} else {
    throw new Error(' Environment variable NODE_ENV must be one of [' +
        allowedEnv.join(',') + ']');
}



var app = express();

//connect to database
var db = require('./libs/mysql_db');
db.connect();



// user json body parser
app.use(jsonBodyParser({
    limit: '50000kb'
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

//enable cors
app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false

}));
//Extract request meta data
app.use(useragent.express());


app.use(morgan('dev'));
app.use('/static', express.static(__dirname + '/public'));

require('./router/index')(app);


app.listen(config.get('port'), function() {
    app.emit('online');
});

// setup not found handler for requests un-served by any routes.
app.use(function(req, res, next) {
    return next(ApiException.newNotFoundError('Request not handled.')
        .addDetails('Request not handled.'));
});

var errorHandler = new ErrorHandler(logger);
app.use(errorHandler.build());

// print when online
app.on('online', function() {
    console.info('App is listening on port ', config.get('port'));
});

module.exports = app;