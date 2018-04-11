'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var TripRequestSchema = new Schema({
  riderId: { type: Schema.Types.ObjectId, ref: 'User' },
  driverId: { type: Schema.Types.ObjectId, ref: 'User' },
  tripId: { type: Schema.Types.ObjectId, ref: 'trip' },
  srcLoc: {
    type: [Number],
    index: '2d'
  },
  destLoc: {
    type: [Number],
    index: '2d'
  },
  paymentMode: { type: String, default: 'CASH' },
  tripRequestStatus: { type: String, default: 'request' },
  tripRequestIssue: { type: String, default: 'busy' },
  pickUpAddress: { type: String, default: null },
  destAddress: { type: String, default: null },
  latitudeDelta: { type: Number, default: 0.012 },
  longitudeDelta: { type: Number, default: 0.012 },
  requestTime: { type: Date, default: Date.now },
  boosterSeatNum: { type: String, default: '0' }
});

TripRequestSchema.statics = {
  userList: function userList() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$skip = _ref.skip,
        skip = _ref$skip === undefined ? 0 : _ref$skip,
        _ref$limit = _ref.limit,
        limit = _ref$limit === undefined ? 10 : _ref$limit,
        _ref$userId = _ref.userId,
        userId = _ref$userId === undefined ? null : _ref$userId,
        _ref$userType = _ref.userType,
        userType = _ref$userType === undefined ? null : _ref$userType;

    var searchObj = {};
    if (userType === 'rider') {
      searchObj = {};
      searchObj.riderId = userId;
    }
    if (userType === 'driver') {
      searchObj = {};
      searchObj.driverId = userId;
    }
    return this.find(searchObj).skip(skip).limit(limit).populate('riderId driverId tripId').execAsync();
  },
  getUserCount: function getUserCount(userType, userId) {
    var searchObj = {};
    if (userType === 'rider') {
      searchObj = {};
      searchObj.riderId = userId;
    }
    if (userType === 'driver') {
      searchObj = {};
      searchObj.driverId = userId;
    }

    return this.countAsync(searchObj);
  }
};

exports.default = _mongoose2.default.model('tripRequest', TripRequestSchema);
module.exports = exports['default'];
//# sourceMappingURL=trip-request.js.map
