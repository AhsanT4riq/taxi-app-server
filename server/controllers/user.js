import bcrypt from 'bcrypt';
import cloudinary from 'cloudinary';
import httpStatus from 'http-status';
import formidable from 'formidable';
import jwt from 'jsonwebtoken';
import APIError from '../helpers/APIError';
import AppConfig from '../models/appConfig';
import config from '../../config/env';
import sendEmail from '../service/emailApi';
import ServerConfig from '../models/serverConfig'; //eslint-disable-line
import User from '../models/user';

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
function getCloudinaryDetails() {
  return new Promise((resolve, reject) => {
    ServerConfig.findOneAsync({ key: 'cloudinaryConfig' })
      .then(foundDetails => {
        resolve(foundDetails.value);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Get appConfig
 * @returns {appConfig}
 */
function getConfig() {
  return new Promise((resolve, reject) => {
    AppConfig.findOneAsync({ key: 'sendConfig' })
      .then(foundDetails => {
        resolve(foundDetails.value);
      })
      .catch(err => {
        reject(err);
      });
  });
}
function getApproveConfig() {
  return new Promise((resolve, reject) => {
    AppConfig.findOneAsync({ key: 'approveConfig' })
      .then(foundDetails => {
        resolve(foundDetails.value);
      })
      .catch(err => {
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
  User.findOneAsync({
    $or: [{ $and: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] }, { $or: [{ email: req.body.email }, { phoneNo: req.body.phoneNo }] }]
  }).then(foundUser => {
    if (foundUser !== null && foundUser.userType === req.body.userType) {
      User.findOneAndUpdateAsync({ _id: foundUser._id }, { $set: { loginStatus: true } }, { new: true }) //eslint-disable-line
        // eslint-disable-next-line
        .then(updateUserObj => {
          if (updateUserObj) {
            const jwtAccessToken = jwt.sign(updateUserObj, config.jwtSecret);
            const returnObj = {
              success: true,
              message: '',
              data: {}
            };
            returnObj.data.jwtAccessToken = `JWT ${jwtAccessToken}`;
            returnObj.data.user = updateUserObj;
            returnObj.message = 'user already exist';
            returnObj.success = false;
            return res.send(returnObj);
          }
        })
        .error(e => {
          const err = new APIError(`error in updating user details while login ${e}`, httpStatus.INTERNAL_SERVER_ERROR);
          next(err);
        });
    } else {
      getApproveConfig().then(values => {
        console.log('[Api Values]', req.body);
        const optValue = Math.floor(100000 + Math.random() * 900000); //eslint-disable-line
        const user = new User({
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
          state: req.body.state,
          zipCode: req.body.zipCode,
          suburb: req.body.suburb,
          street: req.body.street,
          dob: req.body.dob,
          city: req.body.city
        });
        user
          .saveAsync()
          .then(savedUser => {
            const returnObj = {
              success: true,
              message: '',
              data: {}
            };
            const jwtAccessToken = jwt.sign(savedUser, config.jwtSecret);
            returnObj.data.jwtAccessToken = `JWT ${jwtAccessToken}`;
            returnObj.data.user = savedUser;
            returnObj.message = 'user created successfully';
            res.send(returnObj);
            getConfig().then(data => {
              // get new object to add in    host=req.get('host');
              // link="http://"+req.get('host')+"/verify/email?check="+saveduser.otp "&email=" +savedUser.email;
              if (data.sms.otpVerify) {
                sendSms(savedUser._id, `Your OTP is ->` + optValue); //eslint-disable-line
              }
              if (data.email.emailVerify) {
                sendEmail(savedUser._id, savedUser, 'emailVerify'); //eslint-disable-line
              }
              if (data.email.onRegistrationRider && savedUser.userType === 'rider') {
                sendEmail(savedUser._id, savedUser, 'register'); //eslint-disable-line
              }
              if (data.email.onRegistrationDriver && savedUser.userType === 'driver') {
                sendEmail(savedUser._id, savedUser, 'register'); //eslint-disable-line
              }
            });
          })
          .error(e => next(e));
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
  const { user } = req;
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
  user
    .saveAsync()
    .then(savedUser => {
      const returnObj = {
        success: true,
        message: 'user details updated successfully',
        data: savedUser
      };
      res.send(returnObj);
    })
    .error(e => next(e));
}

/**
 * function  to upload pic
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */

function upload(req, res, next) {
  getCloudinaryDetails().then(value => {
    if (value) {
      cloudinary.config({
        cloud_name: value.cloud_name,
        api_key: value.api_key,
        api_secret: value.api_secret
        // cloud_name: 'taxiapp',
        // api_key: '514294449753777',
        // api_secret: 'ch-g8lpWuqOkeGZ0gKUfP711an4',
      });
      const form = new formidable.IncomingForm();
      form.on('error', err => {
        console.error(err); //eslint-disable-line
      });

      form.parse(req, (err, fields, files) => {
        const imgpath = files.image;
        cloudinary.v2.uploader.upload(
          imgpath.path,
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
          (error, results) => {
            if (results) {
              const { user } = req;
              if (req.headers.updatetype === 'profile') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { profileUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user pic updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'photograph') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { photographUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user photographUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'licence') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { licenceUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user licenceDetails updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'permit') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { vechilePaperUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user vechilePaperUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'insurance') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { insuranceUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user insuranceUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'registration') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { rcBookUrl: results.url } },
                  { new: true }
                )
                  .then(savedUser => {
                    const returnObj = {
                      success: true,
                      message: 'user rcBookUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(e => next(e));
              }
              if (req.headers.updatetype === 'license-back') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { licenseBackUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user licenseBackUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'child-safety') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { childSafetyUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user childSafetyUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'hire-service') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { hireServiceUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user hireServiceUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'work-with-child') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { workWithChildUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user workWithChildUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'passenger-license') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { passengerLicenseUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user passengerLicenseUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'charter-license') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { charterLicenseUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user charterLicenseUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'car-photo') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { carPhotoUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user carPhotoUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
              if (req.headers.updatetype === 'passenger-license-code') {
                user.profileUrl = results.url;
                User.findOneAndUpdateAsync(
                  { _id: user._id }, //eslint-disable-line
                  { $set: { passengerLicenseCodeUrl: results.url } },
                  { new: true }
                )
                  .then(function (savedUser) {
                    const returnObj = {
                      success: true,
                      message: 'user passengerLicenseCodeUrl updated successfully',
                      data: savedUser
                    };
                    res.send(returnObj);
                  })
                  .error(function (e) {
                    return next(e);
                  });
              }
            }
          }
        );
      });
    } else {
      const returnObj = {
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
  const { user } = req;
  user
    .removeAsync()
    .then(deletedUser => {
      const returnObj = {
        success: true,
        message: 'user deleted successfully',
        data: deletedUser
      };
      res.send(returnObj);
    })
    .error(e => next(e));
}
/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then(user => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .error(e => next(e));
}
function hashed(password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (hashErr, hash) => {
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
  User.findOneAsync({ email: req.body.email })
    // eslint-disable-next-line
    .then(foundUser => {
      //eslint-disable-line
      if (foundUser) {
        const newPassword = Math.random()
          .toString(36)
          .substr(2, 6);
        hashed(newPassword).then(result => {
          const hashPassword = result;
          User.findOneAndUpdateAsync({ _id: foundUser._id }, { $set: { password: hashPassword } }) //eslint-disable-line
            // eslint-disable-next-line
            .then(updateUserObj => {
              //eslint-disable-line
              if (updateUserObj) {
                getConfig().then(data => {
                  if (data.email.onForgotPassword) {
                    const userObj = Object.assign(updateUserObj, {
                      newpass: newPassword
                    });
                    sendEmail(updateUserObj._id, userObj, 'forgot'); //eslint-disable-line
                  }
                });
                const jwtAccessToken = jwt.sign(updateUserObj, config.jwtSecret);
                const returnObj = {
                  success: true,
                  message: '',
                  data: {}
                };
                returnObj.data.jwtAccessToken = `JWT ${jwtAccessToken}`;
                returnObj.data.user = updateUserObj;
                returnObj.message = 'Check your Email Please';
                returnObj.success = true;
                return res.send(returnObj);
              }
            })
            .error(e => {
              const err = new APIError(`error in updating user details while login ${e}`, httpStatus.INTERNAL_SERVER_ERROR);
              return res.send(err);
            });
        });
      } else {
        const returnObj = {
          success: true,
          message: '',
          data: {}
        };
        returnObj.message = 'No user exist with this email';
        returnObj.success = false;
        return res.send(returnObj);
      }
    })
    .error(e => next(e));
}

export default {
  load,
  get,
  create,
  update,
  remove,
  forgotPassword,
  upload
};
