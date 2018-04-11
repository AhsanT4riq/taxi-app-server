'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // POST /api/users/register
  createUser: {
    body: {
      email: _joi2.default.string().required(),
      password: _joi2.default.string().required(),
      phoneNo: _joi2.default.string().required()
    }
  },

  // UPDATE /api/users
  updateUser: {
    body: {
      fname: _joi2.default.string().required(),
      lname: _joi2.default.string().required(),
      phoneNo: _joi2.default.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      email: _joi2.default.string().required(),
      password: _joi2.default.string().required(),
      userType: _joi2.default.string().required()
    }
  },

  // POST /api/auth/loginadmin
  loginadmin: {
    body: {
      email: _joi2.default.string().required(),
      password: _joi2.default.string().required()
    }
  },

  // GET /api/admin/user
  userList: {
    query: {
      limit: _joi2.default.number().integer().min(1),
      pageNo: _joi2.default.number().integer().min(1),
      userType: _joi2.default.string().required()
    }
  },

  // Get /api/admin/approvePendingUsers
  pending: {
    query: {
      userType: _joi2.default.string().required()
    }
  },
  // PUT /api/admin/approveUser
  approve: {
    query: {
      id: _joi2.default.string().alphanum().required()
    }
  },

  reject: {
    query: {
      id: _joi2.default.string().alphanum().required()
    }
  },
  // GET /api/admin/allusers
  // alluserList: {
  //   query: {
  //     limit: Joi.number().integer().min(1),
  //   }
  // },
  // PUT /api/admin/user: userId

  updateUserByAdmin: {
    body: {
      _id: _joi2.default.string().alphanum().required(),
      userType: _joi2.default.string().valid('rider', 'driver').required()
    }
  },

  // GET /api/admin/tripDetails
  tripList: {
    query: {
      limit: _joi2.default.number().integer().min(1),
      pageNo: _joi2.default.number().integer().min(1)
    }
  },

  // GET /api/admin/tripDetails
  userTripRequestList: {
    query: {
      limit: _joi2.default.number().integer().min(1),
      pageNo: _joi2.default.number().integer().min(1),
      filter: _joi2.default.string()
    }
  },
  tripRevenueGraph: {
    params: {
      revenueYear: _joi2.default.number().integer().min(2000)
    }
  },
  createNewTrip: {
    body: {
      riderId: _joi2.default.string().regex(/^[0-9a-fA-F]{24}$/),
      driverId: _joi2.default.string().regex(/^[0-9a-fA-F]{24}$/)
    }
  },
  updateTripObject: {
    body: {
      riderId: _joi2.default.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      driverId: _joi2.default.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      pickUpAddress: _joi2.default.string().required(),
      destAddress: _joi2.default.string().required(),
      paymentMode: _joi2.default.string().required(),
      taxiType: _joi2.default.string().required(),
      riderRatingByDriver: _joi2.default.number().integer().required(),
      driverRatingByRider: _joi2.default.number().integer().required(),
      tripStatus: _joi2.default.string().required(),
      tripIssue: _joi2.default.string().required(),
      tripAmt: _joi2.default.number().integer().required(),
      seatBooked: _joi2.default.number().integer().required()
    }
  },
  createNewUser: {
    body: {
      userType: _joi2.default.string().valid('rider', 'driver', 'admin', 'superAdmin').required(),
      email: _joi2.default.string().email().required(),
      password: _joi2.default.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=param-validation.js.map
