'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gpsDistance = require('gps-distance');

var _gpsDistance2 = _interopRequireDefault(_gpsDistance);

var _env = require('../../../config/env');

var _env2 = _interopRequireDefault(_env);

var _transformResponse = require('../../service/transform-response');

var _pushExpo = require('../../service/pushExpo');

var _pushExpo2 = _interopRequireDefault(_pushExpo);

var _socketStore = require('../../service/socket-store.js');

var _socketStore2 = _interopRequireDefault(_socketStore);

var _tripRequest = require('../../models/trip-request');

var _tripRequest2 = _interopRequireDefault(_tripRequest);

var _trip = require('../../models/trip');

var _trip2 = _interopRequireDefault(_trip);

var _user = require('../../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * updateLocation handler, handle location update of the rider or driver
 * @param socket object
 * @returns {*}
 */
/* eslint-disable */

function updateLocationHandler(socket) {
  /**
   * updateLocation event is fired by rider or driver whenever their location is changed. also it send location update to corresponding rider or driver if they are in any tripRequest or trip.
   * @param userObj - user whose location has to be updated
   * @returns emit an updateDriverLocation or updateRiderLocation event based on userType.
   */

  socket.on('updateLocation', function (userObj) {
    var userType = userObj.userType;
    var searchObj = {};
    if (userType === 'rider') {
      searchObj = {
        riderId: userObj._id
      };
    } else if (userType === 'driver') {
      searchObj = {
        driverId: userObj._id
      };
    }
    var userID = userObj._id;
    _user2.default.findOneAndUpdateAsync({ _id: userID }, { $set: { gpsLoc: userObj.gpsLoc } }, { new: true }).then(function (updatedUser) {
      _socketStore2.default.emitByUserId(userID, 'locationUpdated', updatedUser);
      _tripRequest2.default.findOneAsync({
        $and: [searchObj, {
          $or: [{ tripRequestStatus: 'enRoute' }, { tripRequestStatus: 'arriving' }, { tripRequestStatus: 'arrived' }]
        }]
      }).then(function (tripRequestObj) {
        if (tripRequestObj) {
          if (userType === 'driver') {
            _socketStore2.default.emitByUserId(tripRequestObj.riderId, 'updateDriverLocation', updatedUser.gpsLoc);
            _socketStore2.default.emitByUserId('59428b1bb0c3cc0f554fd52a', 'getDriverDetails', updatedUser.gpsLoc);
            var driverObj = updatedUser;
            changedTripRequestStatus(driverObj, tripRequestObj);
          } else if (userType === 'rider') {
            _socketStore2.default.emitByUserId(tripRequestObj.driverId, 'updateRiderLocation', updatedUser.gpsLoc);
          }
        } else {
          _trip2.default.findOneAsync({
            $and: [searchObj, { tripStatus: 'onTrip' }]
          }).then(function (tripObj) {
            if (tripObj) {
              if (userType === 'driver') {
                _socketStore2.default.emitByUserId(tripObj.riderId, 'updateDriverLocation', updatedUser.gpsLoc);
                _socketStore2.default.emitByUserId('59428b1bb0c3cc0f554fd52a', 'getDriverDetails', updatedUser.gpsLoc);
              } else if (userType === 'rider') {
                _socketStore2.default.emitByUserId(tripObj.driverId, 'updateRiderLocation', updatedUser.gpsLoc);
              }
            } else {
              // no corresponding rider or driver found to emit the update location
            }
          }).error(function (e) {
            _socketStore2.default.emitByUserId(userID, 'socketError', e);
          });
        }
      }).error(function (e) {
        _socketStore2.default.emitByUserId(userID, 'socketError', e);
      });
    }).error(function (e) {
      _socketStore2.default.emitByUserId(userID, 'socketError', e);
    });
  });
} //eslint-disable-line


function changedTripRequestStatus(driverObj, tripRequestObj) {
  var dist = (0, _gpsDistance2.default)(driverObj.gpsLoc[0], driverObj.gpsLoc[1], tripRequestObj.srcLoc[0], tripRequestObj.srcLoc[1]);
  var newTripRequestStatus = null;
  var currentTripRequestStatus = tripRequestObj.tripRequestStatus;
  dist = dist.toFixed(4) * 1000; // dist in meters
  console.log('gps location driver', driverObj.gpsLoc);
  console.log('distance %%%%%%%%', dist);
  if (dist <= _env2.default.arrivedDistance) {
    newTripRequestStatus = 'arrived';
  } else if (dist > _env2.default.arrivedDistance && dist < _env2.default.arrivingDistance) {
    newTripRequestStatus = 'arriving';
  } else {
    newTripRequestStatus = 'enRoute';
  }
  if (newTripRequestStatus !== currentTripRequestStatus) {
    tripRequestObj.tripRequestStatus = newTripRequestStatus;
    _tripRequest2.default.findOneAndUpdateAsync({ _id: tripRequestObj._id }, { $set: tripRequestObj }, { new: true }).then(function (updatedTripRequestObj) {
      (0, _transformResponse.fetchReturnObj)(updatedTripRequestObj).then(function (updatedTripRequestObj123) {
        if (updatedTripRequestObj123.tripRequestStatus === 'arrived') {
          (0, _pushExpo2.default)(updatedTripRequestObj.riderId, 'Driver has ' + updatedTripRequestObj123.tripRequestStatus);
          (0, _pushExpo2.default)(updatedTripRequestObj.driverId, updatedTripRequestObj123.tripRequestStatus);
        } else {
          (0, _pushExpo2.default)(updatedTripRequestObj.riderId, 'Driver is ' + updatedTripRequestObj123.tripRequestStatus);
          (0, _pushExpo2.default)(updatedTripRequestObj.driverId, updatedTripRequestObj123.tripRequestStatus);
        }
        _socketStore2.default.emitByUserId(updatedTripRequestObj.riderId, 'tripRequestUpdated', updatedTripRequestObj123);
        _socketStore2.default.emitByUserId(updatedTripRequestObj.driverId, 'tripRequestUpdated', updatedTripRequestObj123);
      });
    }).error(function (err) {
      _socketStore2.default.emitByUserId(tripRequestObj.riderId, 'socketError', {
        message: 'error while updating tripRequestStatus based on distance',
        data: err
      });
      _socketStore2.default.emitByUserId(tripRequestObj.driverId, 'socketError', {
        message: 'error while updating tripRequestStatus based on distance',
        data: err
      });
    });
  }
}

exports.default = updateLocationHandler;
module.exports = exports['default'];
//# sourceMappingURL=update-location.js.map
