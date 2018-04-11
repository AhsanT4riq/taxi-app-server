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

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _adminTrip = require('../controllers/admin-trip');

var _adminTrip2 = _interopRequireDefault(_adminTrip);

var _adminTripUser = require('../controllers/admin-trip-user');

var _adminTripUser2 = _interopRequireDefault(_adminTripUser);

var _adminUser = require('../controllers/admin-user');

var _adminUser2 = _interopRequireDefault(_adminUser);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _env = require('../../config/env');

var _env2 = _interopRequireDefault(_env);

var _paramValidation = require('../../config/param-validation');

var _paramValidation2 = _interopRequireDefault(_paramValidation);

var _serverConfig = require('../controllers/server-config');

var _serverConfig2 = _interopRequireDefault(_serverConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//eslint-disable-line

var router = _express2.default.Router();

router.route('/trip').get((0, _expressValidation2.default)(_paramValidation2.default.tripList), _adminTrip2.default.tripDetails).post((0, _expressValidation2.default)(_paramValidation2.default.createNewTrip), _adminTrip2.default.createNewTrip).put((0, _expressValidation2.default)(_paramValidation2.default.updateTripObject), _adminTrip2.default.updateTrip);

router.route('/allusers').post(_adminUser2.default.getTotalUsers);
router.route('/ongoingtrips').get(_adminTrip2.default.getOngoingTripDetails);

router.route('/recentreviewedtrips').get(_adminTrip2.default.getRecentReviewedTripDetails);
router.route('/approvePendingUsers').get((0, _expressValidation2.default)(_paramValidation2.default.pending), _adminUser2.default.getApprovePendingUsers);
router.route('/approveUser').put((0, _expressValidation2.default)(_paramValidation2.default.approve), _adminUser2.default.approveUser);
router.route('/rejectUser').put((0, _expressValidation2.default)(_paramValidation2.default.reject), _adminUser2.default.rejectUser);
router.route('/activeDriverDetails').get(_adminUser2.default.getActiveDriverDetails);
router.route('/activeCustomerDetails').get(_adminUser2.default.getActiveCustomerDetails);

router.route('/specificusertrips/:userId').get(_adminTrip2.default.getSpecificUserTripDetails);

router.route('/serverConfigObj').get(_serverConfig2.default.getConfig);

router.route('/serverConfig').post(_serverConfig2.default.updateConfig);

// /api/admin/user
router.route('/user').get(_adminUser2.default.getAllUsers).post((0, _expressValidation2.default)(_paramValidation2.default.createNewUser), _adminUser2.default.createNewUser).put((0, _expressValidation2.default)(_paramValidation2.default.updateUserByAdmin), _adminUser2.default.updateUserDetails);

router.route('/changepassword').post(_adminUser2.default.changePassword);

router.use(function (req, res, next) {
  _passport2.default.authenticate('jwt', _env2.default.passportOptions, function (error, userDtls, info) {
    //eslint-disable-line
    if (error) {
      var err = new _APIError2.default('token not matched', _httpStatus2.default.UNAUTHORIZED);
      return next(err);
    } else if (userDtls && userDtls.userType === 'admin') {
      req.user = userDtls;
      next();
    } else {
      var _err = new _APIError2.default('token not matched and error msg ' + info, _httpStatus2.default.UNAUTHORIZED);
      return next(_err);
    }
  })(req, res, next);
});
// server Config
router.route('/serverConfig').get(_serverConfig2.default.getConfig).post(_serverConfig2.default.updateConfig);

// /api/admin/allusers
router.route('/allusers').get(_adminUser2.default.getTotalUsers);

router.route('/userDetails/:userId').get(_adminUser2.default.getUsersDetails);

router.route('/user/userStatsChart').get(_adminUser2.default.userStats);

// /api/admin/trip

// .put(adminTrip.updateTrip);

router.route('/trip/charts').get((0, _expressValidation2.default)(_paramValidation2.default.tripRevenueGraph), _adminTrip2.default.tripRevenueGraph);

router.route('/trip/charts/:revenueYear').get((0, _expressValidation2.default)(_paramValidation2.default.tripRevenueGraph), _adminTrip2.default.tripRevenueGraph);

router.route('/trip/:tripId').get((0, _expressValidation2.default)(_paramValidation2.default.userTripRequestList), _adminTrip2.default.loadTripDetails);

router.route('/trip/user/:userId').get((0, _expressValidation2.default)(_paramValidation2.default.userTripRequestList), _adminTripUser2.default.userTripDetails);

router.route('/trip/user/charts/:userId').get((0, _expressValidation2.default)(_paramValidation2.default.userTripRequestList), _adminTripUser2.default.userTripRequestStatics);

exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=admin.js.map
