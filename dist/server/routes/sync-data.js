'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

var _syncData = require('../controllers/sync-data');

var _syncData2 = _interopRequireDefault(_syncData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/**
* Middleware for protected routes. All protected routes need token in the header in the form Authorization: JWT token
*/
router.use(function (req, res, next) {
  _passport2.default.authenticate('jwt', _env2.default.passportOptions, function (error, userDtls, info) {
    //eslint-disable-line
    if (error) {
      var err = new _APIError2.default('token not matched', _httpStatus2.default.INTERNAL_SERVER_ERROR);
      return next(err);
    } else if (userDtls) {
      req.user = userDtls;
      next();
    } else {
      var _err = new _APIError2.default('token is valid but no user found ' + info, _httpStatus2.default.UNAUTHORIZED);
      return next(_err);
    }
  })(req, res, next);
});

/** GET /api/syncData - Returns tripRequest or trip  object if user is in any trip */
router.route('/').get(_syncData2.default.getSyncData);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=sync-data.js.map
