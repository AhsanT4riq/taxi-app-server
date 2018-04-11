'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _nodemailerSmtpTransport = require('nodemailer-smtp-transport');

var _nodemailerSmtpTransport2 = _interopRequireDefault(_nodemailerSmtpTransport);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _serverConfig = require('../models/serverConfig');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmailTemplate = require('email-templates').EmailTemplate; /* eslint-disable */


var registerDir = _path2.default.resolve(__dirname, '../templates', 'register');
var register = new EmailTemplate(_path2.default.join(registerDir));

var endtripDir = _path2.default.resolve(__dirname, '../templates', 'endTrip');
var endTrip = new EmailTemplate(_path2.default.join(endtripDir));

var forgotDir = _path2.default.resolve(__dirname, '../templates', 'forgotPassword');
var forgot = new EmailTemplate(_path2.default.join(forgotDir));

var rideAcceptDir = _path2.default.resolve(__dirname, '../templates', 'rideAccept');
var rideAccept = new EmailTemplate(_path2.default.join(rideAcceptDir));

var emailDir = _path2.default.resolve(__dirname, '../templates', 'emailVerify');
var emailVerify = new EmailTemplate(_path2.default.join(emailDir));

function getEmailApiDetails() {
  return new Promise(function (resolve, reject) {
    _serverConfig2.default.findOneAsync({ key: 'emailConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function sendEmail(userId, responseObj, type) {
  _user2.default.findOneAsync({ _id: userId }).then(function (userObj) {
    getEmailApiDetails().then(function (details) {
      var transporter = _nodemailer2.default.createTransport((0, _nodemailerSmtpTransport2.default)({
        host: details.host,
        port: details.port,
        secure: details.secure, // secure:true for port 465, secure:false for port 587
        auth: {
          user: details.username,
          pass: details.password
        }
      }));
      var locals = Object.assign({}, { data: responseObj });

      if (type === 'emailVerify') {
        emailVerify.render(locals, function (err, results) {
          //eslint-disable-line
          if (err) {
            return console.error(err); //eslint-disable-line
          }
          var mailOptions = {
            from: details.username, // sender address
            to: userObj.email, // list of receivers
            subject: 'Verify your Account with Strap TaxiApp', // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('error in emailApi', error);
              return error;
            }
            console.log('result in emailApi', info);
            return info;
          });
        });
      }

      if (type === 'register') {
        register.render(locals, function (err, results) {
          //eslint-disable-line
          if (err) {
            return console.error(err); //eslint-disable-line
          }
          var mailOptions = {
            from: details.username, // sender address
            to: userObj.email, // list of receivers
            subject: 'Your Account with Strap TaxiApp is created', // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('error in emailApi', error);
              return error;
            }
            console.log('result in emailApi', info);
            return info;
          });
        });
      }
      if (type === 'endTrip') {
        endTrip.render(locals, function (err, results) {
          if (err) {
            return console.error(err);
          }
          var mailOptions = {
            from: details.username, // sender address
            to: userObj.email, // list of receivers
            subject: 'Ride Details with Strap TaxiApp', // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('error in emailApi', error);
              return error;
            }
            console.log('result in emailApi', info);
            return info;
          });
        });
      }
      if (type === 'forgot') {
        forgot.render(locals, function (err, results) {
          if (err) {
            return console.error(err);
          }
          var mailOptions = {
            from: details.username, // sender address
            to: userObj.email, // list of receivers
            subject: 'Your Account Password with Strap TaxiApp', // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('error in emailApi', error);
              return error;
            }
            console.log('result in emailApi', info);
            return info;
          });
        });
      }
      if (type === 'rideAccept') {
        rideAccept.render(locals, function (err, results) {
          if (err) {
            return console.error(err);
          }
          var mailOptions = {
            from: details.username, // sender address
            to: userObj.email, // list of receivers
            subject: 'Strap TaxiApp Driver Details', // Subject line
            text: results.text, // plain text body
            html: results.html // html body
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('error in emailApi', error);
              return error;
            }
            console.log('result in emailApi', info);
            return info;
          });
        });
      }
    });
  });
}
exports.default = sendEmail;
module.exports = exports['default'];
//# sourceMappingURL=emailApi.js.map
