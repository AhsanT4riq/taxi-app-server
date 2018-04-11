'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _serverConfig = require('../models/serverConfig');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable */
function mobileVerify(req, res, next) {} //eslint-disable-line


function emailVerify(req, res, next) {

  _user2.default.findOneAsync({ email: req.query.email })
  //eslint-disable-next-line
  .then(function (foundUser) {
    if (foundUser) {
      var host = req.get('host');
      console.log(req.protocol + ":/" + req.get('host'));
      if (req.protocol + "://" + req.get('host') == "http://" + host) {
        console.log("Domain is matched. Information is from Authentic email");
        if (req.query.check === foundUser.otp) {
          _user2.default.findOneAndUpdateAsync({ email: req.query.email }, { $set: { emailVerified: true } }, { new: true }) //eslint-disable-line
          .then(function (updateUserObj) {
            //eslint-disable-line
            if (updateUserObj) {
              var returnObj = {
                success: true,
                message: 'Email verified',
                data: {}
              };
              // returnObj.data.user = updateUserObj;
              returnObj.success = true;
              return res.send(returnObj);
            }
          }).error(function (e) {
            var err = new APIError('error in updating user details while login ' + e, httpStatus.INTERNAL_SERVER_ERROR);
            next(err);
          });
          console.log("Email is verified");
          res.end("<h1>Email is been Successfully verified</h1>");
        } else {
          console.log("Email is not verified");
          res.end("<h1>Bad Request</h1>");
        }
      }
    }
  });
}

exports.default = { mobileVerify: mobileVerify, emailVerify: emailVerify };
module.exports = exports['default'];
//# sourceMappingURL=verify.js.map
