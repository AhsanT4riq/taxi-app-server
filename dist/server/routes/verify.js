'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _verify = require('../controllers/verify');

var _verify2 = _interopRequireDefault(_verify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.route('/email').post(_verify2.default.emailVerify).put(_verify2.default.emailVerify).get(_verify2.default.emailVerify);

// /** GET /api/verify/mobileVerify -  */

router.route('/mobile').get(_verify2.default.mobileVerify).post(_verify2.default.mobileVerify);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=verify.js.map
