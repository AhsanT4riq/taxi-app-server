'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * User Schema
 */
var UserSchema = new _mongoose2.default.Schema({
  fname: { type: String, default: null },
  lname: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  phoneNo: { type: String, default: '9066274428', unique: true },
  password: { type: String, required: true, select: false },
  dob: { type: Date, default: '12/8/1993' },
  bloodGroup: { type: String, default: 'B+' },
  address: { type: String, default: null },
  city: { type: String, default: 'Melbourne' },
  state: { type: String, default: 'VIC' },
  country: { type: String, default: 'Australia' },
  emergencyDetails: {
    phone: { type: String, default: '' },
    name: { type: String, default: null }
  },
  gpsLoc: {
    type: [Number],
    index: '2d'
  },
  latitudeDelta: { type: Number, default: 0.013 },
  longitudeDelta: { type: Number, default: 0.022 },
  userRating: { type: Number, default: 0 },
  profileUrl: {
    type: String,
    default: 'http://res.cloudinary.com/taxiapp/image/upload/v1505805106/noun_17237_agwqgt.png'
  },
  currTripId: { type: String, default: null },
  currTripState: { type: String, default: null },
  userType: { type: String, default: 'rider' },
  loginStatus: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  otp: { type: Number, default: null },
  isApproved: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  homeAddress: { type: String, default: null },
  workAddress: { type: String, default: null },
  verified: { type: Boolean, default: true },
  jwtAccessToken: { type: String, default: null },
  userCardId: { type: String, default: null },
  carDetails: {
    type: { type: String, default: 'GO' },
    company: { type: String, default: 'Maruti Suzuki' },
    regNo: { type: String, default: 'NYC 123' },
    RC_ownerName: { type: String, default: null },
    vehicleNo: { type: String, default: null },
    carModel: { type: String, default: 'Swift Dzire' },
    regDate: { type: Date, default: '1/1/2017' }
  },
  insuranceUrl: { type: String, default: null },
  vechilePaperUrl: { type: String, default: null },
  rcBookUrl: { type: String, default: null },
  licenceUrl: { type: String, default: null },
  photographUrl: { type: String, default: null },
  licenseBackUrl: { type: String, default: null },
  childSafetyUrl: { type: String, default: null },
  hireServiceUrl: { type: String, default: null },
  workWithChildUrl: { type: String, default: null },
  passengerLicenseUrl: { type: String, default: null },
  charterLicenseUrl: { type: String, default: null },
  carPhotoUrl: { type: String, default: null },
  passengerLicenseCodeUrl: { type: String, default: null },
  licenceDetails: {
    licenceNo: { type: String, default: null },
    issueDate: { type: Date, default: null },
    expDate: { type: Date, default: null }
  },
  bankDetails: {
    accountNo: { type: String, default: null },
    holderName: { type: String, default: null },
    IFSC: { type: String, default: null }
  },
  cardDetails: [{}],
  mapCoordinates: {
    type: [Number],
    index: '2d'
  },
  deviceId: { type: String, default: null },
  pushToken: { type: String, default: null },
  boosterSeat: { type: Boolean, default: false },
  boosterSeatNum: { type: String, default: '0' },
  zipCode: { type: String, default: null },
  suburb: { type: String, default: null },
  street: { type: String, default: null }
});

/**
 * converts the string value of the password to some hashed value
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// eslint-disable-next-line
UserSchema.pre('save', function userSchemaPre(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    // eslint-disable-next-line
    _bcrypt2.default.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      } // eslint-disable-next-line
      _bcrypt2.default.hash(user.password, salt, function (hashErr, hash) {
        //eslint-disable-line
        if (hashErr) {
          return next(hashErr);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

/**
 * comapare the stored hashed value of the password with the given value of the password
 * @param pw - password whose value has to be compare
 * @param cb - callback function
 */
UserSchema.methods.comparePassword = function comparePassword(pw, cb) {
  var that = this;
  // eslint-disable-next-line
  _bcrypt2.default.compare(pw, that.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};
/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get: function get(id) {
    return this.findById(id).execAsync().then(function (user) {
      if (user) {
        return user;
      }
      var err = new _APIError2.default('No such user exists!', _httpStatus2.default.NOT_FOUND);
      return _bluebird2.default.reject(err);
    });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list: function list() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 20 : _ref$limit;

    return this.find({ $or: [{ userType: 'rider' }, { userType: 'driver' }] }).sort({ _id: -1 }).select('-__v').skip(skip).limit(limit).execAsync();
  }
};
/**
 * @typedef User
 */
exports.default = _mongoose2.default.model('User', UserSchema);
module.exports = exports['default'];
//# sourceMappingURL=user.js.map
