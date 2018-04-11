'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _admin = require('./admin');

var _admin2 = _interopRequireDefault(_admin);

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _payment = require('./payment');

var _payment2 = _interopRequireDefault(_payment);

var _syncData = require('./sync-data');

var _syncData2 = _interopRequireDefault(_syncData);

var _trip = require('./trip');

var _trip2 = _interopRequireDefault(_trip);

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _verify = require('./verify');

var _verify2 = _interopRequireDefault(_verify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/** GET /health-check - Check service health */
router.get('/health-check', function (req, res) {
  return res.send('OK');
});

router.get('/', function (req, res) {
  return res.send('OK');
});
// mount user routes at /verify
router.use('/verify', _verify2.default);

// mount user routes at /users
router.use('/users', _user2.default);

// mount user routes at /users
router.use('/config', _config2.default);

// mount auth routes at /auth
router.use('/auth', _auth2.default);

// mount trip routes at /trips
router.use('/trips', _trip2.default);

// mount sync data route at /sync-data
router.use('/syncData', _syncData2.default);

// mount admin routes at /admin
router.use('/admin', _admin2.default);

// mount payment routes at /payment
router.use('/payment', _payment2.default);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
