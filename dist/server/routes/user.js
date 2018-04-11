'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

var _paramValidation = require('../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _user = require('../controllers/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/** POST /api/users/register - create new user and return corresponding user object and token */
router.route('/register').post((0, _expressValidation2.default)(_paramValidation2.default.createUser), _user2.default.create);

// .get(userCtrl.list)


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
      var _err = new _APIError2.default('token not matched ' + info, _httpStatus2.default.UNAUTHORIZED);
      return next(_err);
    }
  })(req, res, next);
});

router.route('/')
/** GET /api/users - Get user */
.get(_user2.default.get)

/** PUT /api/users - Update user */
.put(_user2.default.update)

/** DELETE /api/users - Delete user */
.delete(_user2.default.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', _user2.default.load);

router.route('/upload')
/** PUT /api/users/upload - Update user pic */
.put(_user2.default.upload);
exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=user.js.map
