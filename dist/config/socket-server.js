'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _env = require('./env');

var _env2 = _interopRequireDefault(_env);

var _socketHandler = require('../server/socketHandler');

var _socketHandler2 = _interopRequireDefault(_socketHandler);

var _socketStore = require('../server/service/socket-store');

var _socketStore2 = _interopRequireDefault(_socketStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startSocketServer(server) {
  var io = require('socket.io').listen(server); //eslint-disable-line

  console.log('SocketServer started'); //eslint-disable-line
  io.on('connection', function (socket) {
    console.log('Client connected to socket', socket.id); //eslint-disable-line
    var authToken = socket.handshake.query.token.replace('JWT ', ''); // check for authentication of the socket
    _jsonwebtoken2.default.verify(authToken, _env2.default.jwtSecret, function (err, userDtls) {
      if (err) {
        socket.disconnect();
      } else if (userDtls) {
        socket.userId = userDtls._doc._id; //eslint-disable-line
        console.log('inside socket server \n\n ' + userDtls._doc._id + ' ' + userDtls._doc.email + ' ' + userDtls._doc.fname); //eslint-disable-line
        _socketStore2.default.addByUserId(socket.userId, socket);
        (0, _socketHandler2.default)(socket); // call socketHandler to handle different socket scenario
      }
    });
  });
}

exports.default = { startSocketServer: startSocketServer };
module.exports = exports['default'];
//# sourceMappingURL=socket-server.js.map
