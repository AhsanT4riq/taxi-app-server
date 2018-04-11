'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _appConfig = require('../models/appConfig');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

var _emailApi = require('../service/emailApi');

var _emailApi2 = _interopRequireDefault(_emailApi);

var _serverConfig = require('../models/serverConfig');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.send({ success: true, message: 'user found', data: req.user });
}

/**
 * Get getCloudinaryDetails
 * @returns {getCloudinaryDetails}

 */
//eslint-disable-line
function getCloudinaryDetails() {
  return new Promise(function (resolve, reject) {
    _serverConfig2.default.findOneAsync({ key: 'cloudinaryConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}

/**
 * Get appConfig
 * @returns {appConfig}
 */
function getConfig() {
  return new Promise(function (resolve, reject) {
    _appConfig2.default.findOneAsync({ key: 'sendConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}
function getApproveConfig() {
  return new Promise(function (resolve, reject) {
    _appConfig2.default.findOneAsync({ key: 'approveConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}
/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
// { email: req.body.email, phoneNo: req.body.phoneNo }
function create(req, res, next) {
  _user2.default.findOneAsync({
    $or: [{ $and: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] }, { $or: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] }]
  }).then(function (foundUser) {
    if (foundUser !== null && foundUser.userType === req.body.userType) {
      _user2.default.findOneAndUpdateAsync({ _id: foundUser._id }, { $set: { loginStatus: true } }, { new: true }) //eslint-disable-line
      // eslint-disable-next-line
      .then(function (updateUserObj) {
        if (updateUserObj) {
          var jwtAccessToken = _jsonwebtoken2.default.sign(updateUserObj, _env2.default.jwtSecret);
          var returnObj = {
            success: true,
            message: '',
            data: {}
          };
          returnObj.data.jwtAccessToken = 'JWT ' + jwtAccessToken;
          returnObj.data.user = updateUserObj;
          returnObj.message = 'user already exist';
          returnObj.success = false;
          return res.send(returnObj);
        }
      }).error(function (e) {
        var err = new _APIError2.default('error in updating user details while login ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
        next(err);
      });
    } else {
      getApproveConfig().then(function (values) {
        console.log('[Api Values]', req.body);
        var optValue = Math.floor(100000 + Math.random() * 900000); //eslint-disable-line
        var user = new _user2.default({
          email: req.body.email,
          password: req.body.password,
          userType: req.body.userType,
          fname: req.body.fname,
          lname: req.body.lname,
          phoneNo: req.body.phoneNo,
          gpsLoc: [19.02172902354515, 72.85368273308545],
          carDetails: req.body.userType === 'driver' ? { type: 'sedan' } : {},
          mapCoordinates: [0, 0],
          isApproved: req.body.userType === 'driver' ? values.autoApproveDriver : values.autoApproveRider,
          loginStatus: true,
          otp: optValue,
          boosterSeat: req.body.boosterSeat,
          boosterSeatNum: req.body.boosterSeatNum,
          selectedState: req.body.selectedState,
          zipCode: req.body.zipCode,
          suburb: req.body.suburb,
          street: req.body.street

        });
        user.saveAsync().then(function (savedUser) {
          var returnObj = {
            success: true,
            message: '',
            data: {}
          };
          var jwtAccessToken = _jsonwebtoken2.default.sign(savedUser, _env2.default.jwtSecret);
          returnObj.data.jwtAccessToken = 'JWT ' + jwtAccessToken;
          returnObj.data.user = savedUser;
          returnObj.message = 'user created successfully';
          res.send(returnObj);
          getConfig().then(function (data) {
            // get new object to add in    host=req.get('host');
            // link="http://"+req.get('host')+"/verify/email?check="+saveduser.otp "&email=" +savedUser.email;
            if (data.sms.otpVerify) {
              sendSms(savedUser._id, 'Your OTP is ->' + optValue); //eslint-disable-line
            }
            if (data.email.emailVerify) {
              (0, _emailApi2.default)(savedUser._id, savedUser, 'emailVerify'); //eslint-disable-line
            }
            if (data.email.onRegistrationRider && savedUser.userType === 'rider') {
              (0, _emailApi2.default)(savedUser._id, savedUser, 'register'); //eslint-disable-line
            }
            if (data.email.onRegistrationDriver && savedUser.userType === 'driver') {
              (0, _emailApi2.default)(savedUser._id, savedUser, 'register'); //eslint-disable-line
            }
          });
        }).error(function (e) {
          return next(e);
        });
      });
    }
  });
}

/**
 * Update existing user
 * @property {Object} req.body.user - user object containing all fields.
 * @returns {User}
 */
function update(req, res, next) {
  var user = req.user;

  user.fname = req.body.fname ? req.body.fname : user.fname;
  user.lname = req.body.lname ? req.body.lname : user.lname;
  user.email = req.body.email ? req.body.email : user.email;
  user.phoneNo = req.body.phoneNo ? req.body.phoneNo : user.phoneNo;
  user.deviceId = req.body.deviceId ? req.body.deviceId : user.deviceId;
  user.pushToken = req.body.pushToken ? req.body.pushToken : user.deviceId;
  user.tokenId = req.body.tokenId ? req.body.tokenId : user.tokenId;
  user.emergencyDetails = req.body.emergencyDetails ? req.body.emergencyDetails : user.emergencyDetails;
  user.homeAddress = req.body.homeAddress ? req.body.homeAddress : user.homeAddress;
  user.workAddress = req.body.workAddress ? req.body.workAddress : user.workAddress;
  user.carDetails = req.body.carDetails ? req.body.carDetails : user.carDetails;
  user.licenceDetails = req.body.licenceDetails ? req.body.licenceDetails : user.licenceDetails;
  user.bankDetails = req.body.bankDetails ? req.body.bankDetails : user.bankDetails;
  user.isAvailable = req.body.isAvailable;
  user.saveAsync().then(function (savedUser) {
    var returnObj = {
      success: true,
      message: 'user details updated successfully',
      data: savedUser
    };
    res.send(returnObj);
  }).error(function (e) {
    return next(e);
  });
}

/**
 * function  to upload pic
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */

function upload(req, res, next) {
  getCloudinaryDetails().then(function (value) {
    if (value) {
      _cloudinary2.default.config({
        cloud_name: value.cloud_name,
        api_key: value.api_key,
        api_secret: value.api_secret
        // cloud_name: 'taxiapp',
        // api_key: '514294449753777',
        // api_secret: 'ch-g8lpWuqOkeGZ0gKUfP711an4',
      });
      var form = new _formidable2.default.IncomingForm();
      form.on('error', function (err) {
        console.error(err); //eslint-disable-line
      });

      form.parse(req, function (err, fields, files) {
        var imgpath = files.image;
        _cloudinary2.default.v2.uploader.upload(imgpath.path,
        // {
        //   transformation: [
        //     {
        //       effect: 'improve',
        //       gravity: 'face',
        //       height: 100,
        //       width: 100,
        //       crop: 'fill',
        //     },
        //     { quality: 'auto' },
        //   ],
        // },
        function (error, results) {
          if (results) {
            var user = req.user;

            if (req.headers.updatetype === 'profile') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { profileUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user pic updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'photograph') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { photographUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user photographUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'licence') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { licenceUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user licenceDetails updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'permit') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { vechilePaperUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user vechilePaperUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'insurance') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { insuranceUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user insuranceUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'registration') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { rcBookUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user rcBookUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'license-back') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { licenseBackUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user licenseBackUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'child-safety') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { childSafetyUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user childSafetyUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'hire-service') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { hireServiceUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user hireServiceUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'work-with-child') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { workWithChildUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user workWithChildUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'passenger-license') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { passengerLicenseUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user passengerLicenseUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'charter-license') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { charterLicenseUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user charterLicenseUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'car-photo') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { carPhotoUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user carPhotoUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
            if (req.headers.updatetype === 'passenger-license-code') {
              user.profileUrl = results.url;
              _user2.default.findOneAndUpdateAsync({ _id: user._id }, //eslint-disable-line
              { $set: { passengerLicenseCodeUrl: results.url } }, { new: true }).then(function (savedUser) {
                var returnObj = {
                  success: true,
                  message: 'user passengerLicenseCodeUrl updated successfully',
                  data: savedUser
                };
                res.send(returnObj);
              }).error(function (e) {
                return next(e);
              });
            }
          }
        });
      });
    } else {
      var returnObj = {
        success: false,
        message: 'Problem in updating',
        data: req.user
      };
      res.send(returnObj);
    }
  });
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
// function list(req, res, next) {
//   const { limit = 50, skip = 0 } = req.query;
//   User.list({ limit, skip }).then((users) => res.json(users))
//     .error((e) => next(e));
// }
/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  var user = req.user;

  user.removeAsync().then(function (deletedUser) {
    var returnObj = {
      success: true,
      message: 'user deleted successfully',
      data: deletedUser
    };
    res.send(returnObj);
  }).error(function (e) {
    return next(e);
  });
}
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  _user2.default.get(id).then(function (user) {
    req.user = user; // eslint-disable-line no-param-reassign
    return next();
  }).error(function (e) {
    return next(e);
  });
}
function hashed(password) {
  return new Promise(function (resolve, reject) {
    _bcrypt2.default.genSalt(10, function (err, salt) {
      if (err) {
        reject(err);
      }
      _bcrypt2.default.hash(password, salt, function (hashErr, hash) {
        if (hashErr) {
          reject(hashErr);
        }
        console.log(hash); //eslint-disable-line
        resolve(hash);
      });
    });
  });
}

function forgotPassword(req, res, next) {
  _user2.default.findOneAsync({ email: req.body.email })
  // eslint-disable-next-line
  .then(function (foundUser) {
    //eslint-disable-line
    if (foundUser) {
      var newPassword = Math.random().toString(36).substr(2, 6);
      hashed(newPassword).then(function (result) {
        var hashPassword = result;
        _user2.default.findOneAndUpdateAsync({ _id: foundUser._id }, { $set: { password: hashPassword } }) //eslint-disable-line
        // eslint-disable-next-line
        .then(function (updateUserObj) {
          //eslint-disable-line
          if (updateUserObj) {
            getConfig().then(function (data) {
              if (data.email.onForgotPassword) {
                var userObj = Object.assign(updateUserObj, {
                  newpass: newPassword
                });
                (0, _emailApi2.default)(updateUserObj._id, userObj, 'forgot'); //eslint-disable-line
              }
            });
            var jwtAccessToken = _jsonwebtoken2.default.sign(updateUserObj, _env2.default.jwtSecret);
            var returnObj = {
              success: true,
              message: '',
              data: {}
            };
            returnObj.data.jwtAccessToken = 'JWT ' + jwtAccessToken;
            returnObj.data.user = updateUserObj;
            returnObj.message = 'Check your Email Please';
            returnObj.success = true;
            return res.send(returnObj);
          }
        }).error(function (e) {
          var err = new _APIError2.default('error in updating user details while login ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
          return res.send(err);
        });
      });
    } else {
      var returnObj = {
        success: true,
        message: '',
        data: {}
      };
      returnObj.message = 'No user exist with this email';
      returnObj.success = false;
      return res.send(returnObj);
    }
  }).error(function (e) {
    return next(e);
  });
}

exports.default = {
  load: load,
  get: get,
  create: create,
  update: update,
  remove: remove,
  forgotPassword: forgotPassword,
  upload: upload
};
module.exports = exports['default'];
//# sourceMappingURL=user.js.map
