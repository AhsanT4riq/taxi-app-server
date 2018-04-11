'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _adminSocket = require('./story/admin-socket');

var _adminSocket2 = _interopRequireDefault(_adminSocket);

var _nearbyDriverHandler = require('./story/nearby-driver-handler');

var _nearbyDriverHandler2 = _interopRequireDefault(_nearbyDriverHandler);

var _requestTrip = require('./story/request-trip');

var _requestTrip2 = _interopRequireDefault(_requestTrip);

var _socketStore = require('../service/socket-store');

var _socketStore2 = _interopRequireDefault(_socketStore);

var _startTrip = require('./story/start-trip');

var _startTrip2 = _interopRequireDefault(_startTrip);

var _updateLocation = require('./story/update-location');

var _updateLocation2 = _interopRequireDefault(_updateLocation);

var _userHandler = require('./story/user-handler');

var _userHandler2 = _interopRequireDefault(_userHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socketHandler = function socketHandler(socket) {
  (0, _requestTrip2.default)(socket);
  (0, _startTrip2.default)(socket);
  (0, _updateLocation2.default)(socket);
  (0, _nearbyDriverHandler2.default)(socket);
  (0, _adminSocket2.default)(socket);
  (0, _userHandler2.default)(socket);
  socket.on('hello', function () {
    socket.emit('helloResponse', 'hello everyone');
  });
  socket.on('disconnect', function () {
    _socketStore2.default.removeByUserId(socket.userId, socket);
  });
};

exports.default = socketHandler;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
