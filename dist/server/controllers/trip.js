'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _transformResponse = require('../service/transform-response');

var _trip = require('../models/trip');

var _trip2 = _interopRequireDefault(_trip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return the trip details of the user.
 * @param req
 * @param res
 * @param next
 * @returns { trip: historyObjArray[{ tripObj }]  }
 */

function getHistory(req, res, next) {
  var historyObjArray = [];
  var userID = req.user._id; //eslint-disable-line
  var userType = req.user.userType;
  var searchObj = {};
  if (userType === 'rider') {
    searchObj.riderId = userID;
  } else if (userType === 'driver') {
    searchObj.driverId = userID;
  }
  _trip2.default.find({ $and: [searchObj, { tripStatus: 'endTrip' }] }, null, { sort: { bookingTime: -1 } }, function (tripErr, tripObj) {
    //eslint-disable-line
    if (tripErr) {
      var err = new _APIError2.default('error while finding trip history for the user  ' + tripErr, _httpStatus2.default.INTERNAL_SERVER_ERROR);
      return next(err);
    }
    if (tripObj.length !== 0) {
      tripObj.forEach(function (obj, index) {
        (0, _transformResponse.fetchReturnObj)(obj).then(function (transformedReturnObj) {
          historyObjArray.push(transformedReturnObj);
          if (index === tripObj.length - 1) {
            var returnObj = {
              success: true,
              message: 'user trip history',
              data: historyObjArray
            };
            res.send(returnObj);
          }
        });
      });
    } else {
      var returnObj = {
        success: true,
        message: 'no history available',
        data: []
      };
      res.send(returnObj);
    }
  });
}

exports.default = { getHistory: getHistory };
module.exports = exports['default'];
//# sourceMappingURL=trip.js.map
