var ApiException = require('../libs/core/ApiException');
var responseMessage = require('../assets/responseMessage');
var api_events = require('../assets/api_events');
var logger = require('../libs/logger');



var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var path = require('path');
var fs = require('fs');
var config = require('config');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

//export modules

var mailer = {};
module.exports = mailer;


var fromMail = config.get('mailFrom');
//create mail transporter
var transporter = nodemailer.createTransport(smtpTransport(config.get('mailCredential')));

//verify transporter
transporter.verify(function(error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Mail server configured!');
    }
});


//Html parser middleware
transporter.use('compile', htmlToText());

/**
 * Log email send error
 */
var logMailError = function(err) {
    if (err) {
        logger.log(ApiException.newInternalError(err.message).addDetails(responseMessage.MAIL_NOT_SENT));
    }
};

/**
 * Forget password mail template
 */
var forgetPasswordTemplate = transporter.templateSender({
    subject: 'Password Reset',
    html: fs.readFileSync(path.resolve(__dirname, '..', 'assets/templates/forgetpassword.html')).toString()
}, {
    from: fromMail
});


/**
 * Sign up mail template
 */

var signUpMailTemplate = transporter.templateSender({
    subject: 'Welcome Mail',
    html: fs.readFileSync(path.resolve(__dirname, '..', 'assets/templates/signUp.html')).toString()
}, {
    from: fromMail
});


/**
 * Send mail method
 */
mailer.sendMail = function(code, toEmail, mailContent) {
    switch (code) {
        case api_events.forget_password.event_code:
            forgetPasswordTemplate({ to: toEmail }, mailContent, logMailError);
            break;
        case api_events.user_signup.event_code:
            signUpMailTemplate({ to: toEmail }, mailContent, logMailError);
            break;
    }
};

/**
 * Business owner sign up mail 
 */
mailer.sendListingSignUpMail = function(toEmail, mailContent, from) {
    var listingSignUpMailTemplate = transporter.templateSender({
        subject: 'Welcome Mail',
        html: fs.readFileSync(path.resolve(__dirname, '..', 'assets/templates/listingSignUp.html')).toString()
    }, {
        from: from
    });
    listingSignUpMailTemplate({ to: toEmail, replyTo: from.email }, mailContent, logMailError);
};