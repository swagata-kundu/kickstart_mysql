var config = require('config');
var Push = require('../libs/Push');
var path = require('path');

// define module
var pushNotifier = {};
module.exports = pushNotifier;

// setup push instance
var push = new Push();
var apnConf = config.get('push.apn');
var gcmConf = config.get('push.gcm');

//TODO - get apn certs and gcm key
push.initApn(apnConf.production,
    path.resolve(__dirname, '..', apnConf.cert_path),
    path.resolve(__dirname, '..', apnConf.key_path));

push.initGcm(gcmConf.gcm_key);

// enable pruning of stored push devices based on push feedback.
push.setFeedbackHandler(function(service, event, oldId, newId) {
    if (event === 'deleted') {

    } else if (event === 'updated') {

    }
});

// set formatter for apn push
push.setApnNoteFormatter(function(note, data) {
    note.alert = data.message;
    note.payload = data.payload;
    note.retryLimit = 1; //--retry 1 time--
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // expire 1 hour from now
    note.event_type = data.event_type;
});

// set formatter for gcm push
push.setGcmMessageFormatter(function(msg, data) {
    var gcm_data = {};
    gcm_data.message = data.payload;
    gcm_data.message.aps = {};
    gcm_data.message.aps.alert = data.message;
    msg.addData(gcm_data);

});

/**
 * Send a push notification to given push devices. The type of notification is to be conveyed by code,
 * and should be used to specify a corresponding message.
 * The data for the message is in the given payload.
 * @param {array} gcm device - an array of gcm devices.
 * @param {array} apn device - an array of apn devices.
 * @param {object} payload - notification data.
 */

pushNotifier.sendPush = function(gcm_devices, apn_devices, payload, callback) {
    callback();
    var data = { payload: payload, message: payload.message };
    if (apn_devices.length) {
        push.sendApn(apn_devices, data);
    }
    if (gcm_devices.length) {
        push.sendGcm(gcm_devices, data);
    }
};