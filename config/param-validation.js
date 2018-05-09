import Joi from 'joi';

export default {
  // POST /api/users/register
  createUser: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required(),
      phoneNo: Joi.string().required()
    }
  },

 // POST /api/users/customerService
 customerService: {
  body: {
    email: Joi.string().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    message: Joi.string().required(),
    phoneNo: Joi.string().required(),
    state: Joi.string().required()
  }
},

  // UPDATE /api/users
  updateUser: {
    body: {
      fname: Joi.string().required(),
      lname: Joi.string().required(),
      phoneNo: Joi.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required(),
      userType: Joi.string().required()
    }
  },

  // POST /api/auth/loginadmin
  loginadmin: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // GET /api/admin/user
  userList: {
    query: {
      limit: Joi.number()
        .integer()
        .min(1),
      pageNo: Joi.number()
        .integer()
        .min(1),
      userType: Joi.string().required()
    }
  },

  // Get /api/admin/approvePendingUsers
  pending: {
    query: {
      userType: Joi.string().required()
    }
  },
  // PUT /api/admin/approveUser
  approve: {
    query: {
      id: Joi.string()
        .alphanum()
        .required()
    }
  },

  reject: {
    query: {
      id: Joi.string()
        .alphanum()
        .required()
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
      _id: Joi.string()
        .alphanum()
        .required(),
      userType: Joi.string()
        .valid('rider', 'driver')
        .required()
    }
  },

  // GET /api/admin/tripDetails
  tripList: {
    query: {
      limit: Joi.number()
        .integer()
        .min(1),
      pageNo: Joi.number()
        .integer()
        .min(1)
    }
  },

  // GET /api/admin/tripDetails
  userTripRequestList: {
    query: {
      limit: Joi.number()
        .integer()
        .min(1),
      pageNo: Joi.number()
        .integer()
        .min(1),
      filter: Joi.string()
    }
  },
  tripRevenueGraph: {
    params: {
      revenueYear: Joi.number()
        .integer()
        .min(2000)
    }
  },
  createNewTrip: {
    body: {
      riderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      driverId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    }
  },
  updateTripObject: {
    body: {
      riderId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      driverId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      pickUpAddress: Joi.string().required(),
      destAddress: Joi.string().required(),
      paymentMode: Joi.string().required(),
      taxiType: Joi.string().required(),
      riderRatingByDriver: Joi.number()
        .integer()
        .required(),
      driverRatingByRider: Joi.number()
        .integer()
        .required(),
      tripStatus: Joi.string().required(),
      tripIssue: Joi.string().required(),
      tripAmt: Joi.number()
        .integer()
        .required(),
      seatBooked: Joi.number()
        .integer()
        .required()
    }
  },
  createNewUser: {
    body: {
      userType: Joi.string()
        .valid('rider', 'driver', 'admin', 'superAdmin')
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required()
    }
  }
};
