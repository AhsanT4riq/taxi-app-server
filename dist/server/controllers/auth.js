'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns jwt token  and user object if valid email and password is provided
 * @param req (email, password, userType)
 * @param res
 * @param next
 * @returns {jwtAccessToken, user}
 */

function loginadmin(req, res, next) {
  _user2.default.findOneAsync({ email: req.body.email, $or: [{ userType: 'admin' }, { userType: 'superAdmin' }] }, '+password').then(function (user) {
    //eslint-disable-line
    if (!user) {
      var err = new _APIError2.default('User not found with the given email id', _httpStatus2.default.NOT_FOUND);
      return next(err);
    } else {
      user.comparePassword(req.body.password, function (passwordError, isMatch) {
        //eslint-disable-line
        if (passwordError || !isMatch) {
          var _err = new _APIError2.default('Incorrect password', _httpStatus2.default.UNAUTHORIZED);
          return next(_err);
        }
        user.loginStatus = true;
        user.gpsLoc = [19.02172902354515, 72.85368273308545];
        var token = _jsonwebtoken2.default.sign(user, _env2.default.jwtSecret);
        _user2.default.findOneAndUpdateAsync({ _id: user._id }, { $set: user }, { new: true }) //eslint-disable-line
        .then(function (updatedUser) {
          var returnObj = {
            success: true,
            message: 'user successfully logged in',
            data: {
              jwtAccessToken: 'JWT ' + token,
              user: updatedUser
            }
          };
          res.json(returnObj);
        }).error(function (err123) {
          var err = new _APIError2.default('error in updating user details while login ' + err123, _httpStatus2.default.INTERNAL_SERVER_ERROR);
          next(err);
        });
      });
    }
  }).error(function (e) {
    var err = new _APIError2.default('erro while finding user ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
    next(err);
  });
}

function login(req, res, next) {
  var userObj = {
    email: req.body.email,
    userType: req.body.userType
  };

  _user2.default.findOneAsync(userObj, '+password').then(function (user) {
    //eslint-disable-line
    if (!user) {
      var err = new _APIError2.default('User not found with the given email id', _httpStatus2.default.NOT_FOUND);
      return next(err);
    } else {
      user.comparePassword(req.body.password, function (passwordError, isMatch) {
        //eslint-disable-line
        if (passwordError || !isMatch) {
          var _err2 = new _APIError2.default('Incorrect password', _httpStatus2.default.UNAUTHORIZED);
          return next(_err2);
        }
        user.loginStatus = true;
        user.gpsLoc = [19.02172902354515, 72.85368273308545];
        var token = _jsonwebtoken2.default.sign(user, _env2.default.jwtSecret);
        _user2.default.findOneAndUpdateAsync({ _id: user._id }, { $set: user }, { new: true }) //eslint-disable-line
        .then(function (updatedUser) {
          var returnObj = {
            success: true,
            message: 'user successfully logged in',
            data: {
              jwtAccessToken: 'JWT ' + token,
              user: updatedUser
            }
          };
          res.json(returnObj);
        }).error(function (err123) {
          var err = new _APIError2.default('error in updating user details while login ' + err123, _httpStatus2.default.INTERNAL_SERVER_ERROR);
          next(err);
        });
      });
    }
  }).error(function (e) {
    var err = new _APIError2.default('erro while finding user ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
    next(err);
  });
}

/** This is a protected route. Change login status to false and send success message.
 * @param req
 * @param res
 * @param next
 * @returns success message
 */

function logout(req, res, next) {
  var userObj = req.user;
  if (userObj === undefined || userObj === null) {
    console.log('user obj is null or undefined inside logout function'); //eslint-disable-line
  }
  userObj.loginStatus = false;
  _user2.default.findOneAndUpdate({ _id: userObj._id, loginStatus: true }, { $set: userObj }, { new: true }, function (err, userDoc) {
    //eslint-disable-line
    if (err) {
      var error = new _APIError2.default('error while updateing login status', _httpStatus2.default.INTERNAL_SERVER_ERROR);
      next(error);
    }
    if (userDoc) {
      var returnObj = {
        success: true,
        message: 'user logout successfully'
      };
      res.json(returnObj);
    } else {
      var _error = new _APIError2.default('user not found', _httpStatus2.default.NOT_FOUND);
      next(_error);
    }
  });
}
// { $or: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] }
function checkUser(req, res) {
  _user2.default.findOneAsync({ email: req.body.email }).then(function (foundUser) {
    if (foundUser !== null) {
      var jwtAccessToken = _jsonwebtoken2.default.sign(foundUser, _env2.default.jwtSecret);
      var returnObj = {
        success: true,
        message: 'User Exist',
        data: {}
      };
      returnObj.data = {
        user: foundUser,
        jwtAccessToken: 'JWT ' + jwtAccessToken
      };
      return res.send(returnObj);
    } else {
      var _returnObj = {
        success: true,
        message: 'New User'
      };
      return res.send(_returnObj);
    }
  }).catch(function (error) {
    console.log(error); //eslint-disable-line
  });
}

exports.default = {
  login: login,
  logout: logout,
  checkUser: checkUser,
  loginadmin: loginadmin
};
module.exports = exports['default'];
//# sourceMappingURL=auth.js.map
