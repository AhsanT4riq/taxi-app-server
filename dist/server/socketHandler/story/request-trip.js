'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _deferred = require('deferred');

var _deferred2 = _interopRequireDefault(_deferred);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _APIError = require('../../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _appConfig = require('../../models/appConfig');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _env = require('../../../config/env');

var _env2 = _interopRequireDefault(_env);

var _transformResponse = require('../../service/transform-response');

var _emailApi = require('../../service/emailApi');

var _emailApi2 = _interopRequireDefault(_emailApi);

var _pushExpo = require('../../service/pushExpo');

var _pushExpo2 = _interopRequireDefault(_pushExpo);

var _smsApi = require('../../service/smsApi');

var _smsApi2 = _interopRequireDefault(_smsApi);

var _socketStore = require('../../service/socket-store.js');

var _socketStore2 = _interopRequireDefault(_socketStore);

var _tripRequest = require('../../models/trip-request');

var _tripRequest2 = _interopRequireDefault(_tripRequest);

var _user = require('../../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//eslint-disable-line
var watchIdObj = {}; /* eslint-disable */

var promObj = {};
/**
 * Get appConfig
 * @returns {appConfig}
 */
function getConfig() {
  return new _bluebird2.default(function (resolve, reject) {
    _appConfig2.default.findOneAsync({ key: 'sendConfig' }).then(function (foundDetails) {
      resolve(foundDetails.value);
    }).catch(function (err) {
      reject(err);
    });
  });
}

function requestTripHandler(socket) {
  socket.on('requestTrip', function (payload) {
    var quantum = 10;
    var riderID = payload.rider._id;
    nearByDriver(riderID).then(function (nearByDriversDoc) {
      for (var i = 0; i < nearByDriversDoc.length - 1; i++) {
        if (!checkSocketConnection(nearByDriversDoc[i]._id)) {
          nearByDriversDoc = removeDriverFromList(nearByDriversDoc, i);
        }
      }
      roundRobinAsync(nearByDriversDoc, quantum, payload).then(function (result) {
        if (result === false) {
          console.log('Payload', payload);
          payload.tripRequest.tripRequestStatus = 'noNearByDriver';
          (0, _pushExpo2.default)(riderID, 'No nearby drivers');
          _socketStore2.default.emitByUserId(payload.rider._id, 'tripRequestUpdated', payload.tripRequest);
        }
      }).catch(function (e) {
        return console.log('error', e);
      });
    }).catch(function (e) {
      return console.log('error', e);
    });
  });
  socket.on('requestDriverResponse', function (tripRequest) {
    clearInterval(watchIdObj[tripRequest._id]);
    var driverId = tripRequest.driver._id;
    promObj[driverId].resolve(tripRequest); // or resolve promise
  });
  socket.on('tripRequestUpdate', function (payload) {
    _tripRequest2.default.findOneAndUpdateAsync({ _id: payload._id }, { $set: payload }, { new: true }).then(function (updatedTripRequestObject) {
      if (updatedTripRequestObject.tripRequestStatus === 'cancelled') {
        _user2.default.updateAsync({ $or: [{ _id: payload.riderId }, { _id: payload.driverId }] }, { $set: { currTripId: null, currTripState: null } }, { new: true, multi: true }).then(function () {
          // updated user records
        }).error(function (e) {
          _socketStore2.default.emitByUserId(payload.riderId, 'socketError', { message: 'error while updating curTripId  to null in requestDriverResponse', data: e });
          _socketStore2.default.emitByUserId(payload.driverId, 'socketError', { message: 'error while updating curTripId to null in requestDriverResponse', data: e });
        });
      }
      (0, _transformResponse.fetchReturnObj)(updatedTripRequestObject).then(function (updatedTripRequestObj) {
        if (socket.userId.toString() === updatedTripRequestObj.riderId.toString()) {
          console.log('updatedTripRequestObj.riderId', updatedTripRequestObj.riderId);
          (0, _pushExpo2.default)(updatedTripRequestObj.riderId, updatedTripRequestObj.tripRequestStatus);
          (0, _pushExpo2.default)(updatedTripRequestObj.driver, updatedTripRequestObj.tripRequestStatus);
          _socketStore2.default.emitByUserId(updatedTripRequestObj.driverId, 'tripRequestUpdated', updatedTripRequestObj);
        } else if (socket.userId.toString() === updatedTripRequestObj.driverId.toString()) {
          _socketStore2.default.emitByUserId(updatedTripRequestObj.riderId, 'tripRequestUpdated', updatedTripRequestObj);
          (0, _pushExpo2.default)(updatedTripRequestObj.riderId, updatedTripRequestObj.tripRequestStatus);
          (0, _pushExpo2.default)(updatedTripRequestObj.driver, updatedTripRequestObj.tripRequestStatus);
        }
      });
    }).error(function (e) {
      // error occured while updating tripRequestObj
      _socketStore2.default.emitByUserId(payload.riderId, 'socketError', e);
      _socketStore2.default.emitByUserId(payload.driverId, 'socketError', e);
    });
  });
  // Round robin algorithm for driver dispatch:
  function roundRobinAsync(nearByDriversDoc, quantum, rider) {
    // returns promise which resolves in success and faliure boolean values
    // suppose 5 drivers
    // each driver will be sent request.
    // expect a response in quantum time.
    // if response is accept - assign that driver. break process and return
    // if response is reject - remove driver from the list and select next driver to request from queue
    // if no response - next driver please.
    // - no arrival time burst time concept.
    // - queue structure will be based on database query fetch.
    return new _bluebird2.default(function (resolve, reject) {
      var count = 0;
      var remain = nearByDriversDoc.length;
      var prom = (0, _deferred2.default)();
      dispatchHandlerAsync(nearByDriversDoc, quantum, remain, count, rider, prom).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  }
  function dispatchHandlerAsync(nearByDrivers, quantum, remain, count, rider, prom) {
    if (remain <= 0) {
      prom.resolve(false);
      return prom.promise;
    }
    promObj[nearByDrivers[count]._id] = (0, _deferred2.default)();
    sendRequestAsync(nearByDrivers[count], quantum, rider, promObj[nearByDrivers[count]._id]).then(function (tripRequest) {
      var response = tripRequest.tripRequestStatus;
      if (response === 'enRoute') {
        dispatchDriverAsync(tripRequest).then(function () {
          return prom.resolve(true);
        }).catch(function (error) {
          return prom.reject(error);
        });
        getConfig().then(function (data) {
          if (data.email.rideAcceptRider) {
            (0, _emailApi2.default)(tripRequest.riderId, tripRequest, 'rideAccept');
          }
          if (data.sms.rideAcceptRider) {
            (0, _smsApi2.default)(tripRequest.riderId, 'Your ride request is accepted .');
          }
        });
      } else if (response === 'rejected') {
        resetTripRequestAsync(nearByDrivers[count]) // driver rejected so update the database to clear tripRequest made
        .then(function () {
          nearByDrivers = removeDriverFromList(nearByDrivers, count);
          // nearByDrivers.forEach((driver) => console.log(driver.fname));
          count = 0;
          remain--;
          setTimeout(function () {
            dispatchHandlerAsync(nearByDrivers, quantum, remain, count, rider, prom);
          }, 1000);
        });
      }
    }, function () {
      console.log('noResponseFromDriver');
      nearByDrivers = removeDriverFromList(nearByDrivers, count);
      count = 0;
      remain--;
      setTimeout(function () {
        dispatchHandlerAsync(nearByDrivers, quantum, remain, count, rider, prom);
      }, 1000);
    });
    return prom.promise;
  }
  function sendRequestAsync(driver, timeout, rider, def) {
    // return tripRequest object which contain response
    console.log('inside sendRequestAsync', driver.fname);
    createTripRequestObjAsync(rider, driver).then(function (tripRequestObj) {
      _socketStore2.default.emitByUserId(driver._id, 'requestDriver', tripRequestObj);
      watchIdObj[tripRequestObj._id] = setInterval(function () {
        timeout--;
        if (timeout <= 0) {
          clearInterval(watchIdObj[tripRequestObj._id]);
          resetTripRequestAsync(driver) // driver did not respond so update the database to clear tripRequest made.
          .then(function () {
            _socketStore2.default.emitByUserId(driver._id, 'responseTimedOut'); // clear tripRequest object on driver side
            // flag = true;
            def.reject('noResponseFromDriver');
          });
        }
      }, 1000);
    }).catch(function (err) {
      return console.log('error', err);
    });
    return def.promise;
  }
  function dispatchDriverAsync(tripRequestObj) {
    return new _bluebird2.default(function (resolve) {
      _tripRequest2.default.findOneAndUpdateAsync({ _id: tripRequestObj._id }, { $set: tripRequestObj }, { new: true }).then(function (updatedTripRequestObject) {
        return resolve((0, _transformResponse.fetchReturnObj)(updatedTripRequestObject).then(function (updatedTripRequestObj) {
          if (updatedTripRequestObj.tripRequestStatus === 'noNearByDriver') {
            updatedTripRequestObj.rider = null;
            updatedTripRequestObj.driver = null;
            updatedTripRequestObj.driverId = null;
          }
          _socketStore2.default.emitByUserId(tripRequestObj.riderId, 'tripRequestUpdated', updatedTripRequestObj);
        }));
      }).error(function (e) {
        _socketStore2.default.emitByUserId(tripRequestObj.driverId, 'socketError', e);
      });
    });
  }
  function removeDriverFromList(drivers, index) {
    // test passed
    return drivers.slice(0, index).concat(drivers.slice(index + 1));
  }
  function createTripRequestObjAsync(payload, driver) {
    return new _bluebird2.default(function (resolve) {
      var riderID = payload.rider._id;
      var srcLocation = payload.tripRequest.srcLoc;
      var destLocation = payload.tripRequest.destLoc;
      var pickUpAdrs = payload.tripRequest.pickUpAddress;
      var destAdrs = payload.tripRequest.destAddress;
      var latDelta = payload.tripRequest.latitudeDelta;
      var lonDelta = payload.tripRequest.longitudeDelta;
      var paymentMode = payload.tripRequest.paymentMode;
      var driverID = driver._id;
      var boosterSeatNum = payload.tripRequest.boosterSeatNum;
      var tripRequestObj = new _tripRequest2.default({
        riderId: riderID,
        driverId: driverID,
        tripId: null,
        srcLoc: srcLocation,
        destLoc: destLocation,
        pickUpAddress: pickUpAdrs,
        destAddress: destAdrs,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
        boosterSeatNum: boosterSeatNum,
        paymentMode: paymentMode
      });
      tripRequestObj.saveAsync().then(function (savedTripRequest) {
        savedTripRequest.rider = null;
        savedTripRequest.driver = null;
        _user2.default.updateAsync({ $or: [{ _id: savedTripRequest.riderId }, { _id: savedTripRequest.driverId }] }, { $set: { currTripId: savedTripRequest._id, currTripState: 'tripRequest' } }, { new: true, multi: true }).then(function () {
          (0, _transformResponse.fetchReturnObj)(savedTripRequest).then(function (returnObj) {
            return resolve(returnObj);
          });
        }).error(function (e) {
          _socketStore2.default.emitByUserId(riderID, 'socketError', { message: 'error while updating curTripId in requestTrip', data: e });
          _socketStore2.default.emitByUserId(driverID, 'socketError', { message: 'error while updating curTripId in requestTrip', data: e });
        });
      }).error(function (e) {
        _socketStore2.default.emitByUserId(riderID, 'socketError', e);
      });
    });
  }
  function resetTripRequestAsync(driverObj) {
    // query to reset tripRequest object for a particular driver in database.
    return new _bluebird2.default(function (resolve) {
      _user2.default.updateAsync({ $or: [{ _id: driverObj._id }] }, { $set: { currTripId: null, currTripState: null } }, { new: true, multi: true }).then(function () {
        return resolve();
      }).error(function (e) {
        _socketStore2.default.emitByUserId(driverObj.riderId, 'socketError', { message: 'error while updating curTripId  to null in requestDriverResponse', data: e });
        _socketStore2.default.emitByUserId(driverObj.driverId, 'socketError', { message: 'error while updating curTripId to null in requestDriverResponse', data: e });
      });
    });
  }
  function checkSocketConnection(id) {
    var res = _socketStore2.default.getByUserId(id);
    if (res.success && res.data.length) {
      return true;
    } else {
      return false;
    }
  }
  function nearByDriver(riderId) {
    return new _bluebird2.default(function (resolve, reject) {
      return _user2.default.findOneAsync({ _id: riderId, userType: 'rider' }).then(function (userDoc) {
        if (userDoc) {
          return _user2.default.findAsync({ $and: [{ gpsLoc: { $geoWithin: { $center: [userDoc.gpsLoc, _env2.default.radius] } } }, { currTripId: null, currTripState: null }, { loginStatus: true }, { userType: 'driver' }] }).then(function (driverDoc) {
            if (driverDoc) {
              return resolve(driverDoc);
            } else {
              // console.log('no nearByDriver driver found');
              var err = new _APIError2.default('no nearByDriver found', _httpStatus2.default.INTERNAL_SERVER_ERROR);
              return reject(err);
            }
          }).error(function (driverErr) {
            // console.log('error while searching near by driver ');
            reject(driverErr);
          });
        } else {
          // console.log('no rider found with the given rider id');
          var err = new _APIError2.default('no rider found with the given id', _httpStatus2.default.INTERNAL_SERVER_ERROR);
          return reject(err);
        }
      }).error(function (e) {
        // console.log('error while searching rider ');
        var err = new _APIError2.default('error while searching user ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
        reject(err);
      });
    });
  }
}

exports.default = requestTripHandler;
module.exports = exports['default'];
//# sourceMappingURL=request-trip.js.map
