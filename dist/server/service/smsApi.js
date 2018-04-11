'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _twilio = require('twilio');

var _twilio2 = _interopRequireDefault(_twilio);

var _serverConfig = require('../models/serverConfig');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSmsApiDetails() {
  return new Promise(function (resolve, reject) {
    _serverConfig2.default.findOneAsync({ key: 'smsConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function sendSms(userId, smsText) {
  _user2.default.findOneAsync({ _id: userId }).then(function (userObj) {
    getSmsApiDetails().then(function (details) {
      var twilio = new _twilio2.default(details.accountSid, details.token);
      twilio.messages.create({
        from: details.from,
        to: userObj.phoneNo,
        body: smsText
      }, function (err, result) {
        if (err) {
          return err;
        }
        return result;
      });
    });
  });
}
exports.default = sendSms;
module.exports = exports['default'];
//# sourceMappingURL=smsApi.js.map
