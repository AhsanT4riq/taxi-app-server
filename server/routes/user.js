import express from 'express';
import validate from 'express-validation';
import httpStatus from 'http-status';
import passport from 'passport';

import APIError from '../helpers/APIError';
import config from '../../config/env';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user';

const router = express.Router();

/** POST /api/users/register - create new user and return corresponding user object and token */
router.route('/register')
  .post(validate(paramValidation.createUser), userCtrl.create);

// .get(userCtrl.list)


/**
  * Middleware for protected routes. All protected routes need token in the header in the form Authorization: JWT token
  */
router.use((req, res, next) => {
  passport.authenticate('jwt', config.passportOptions, (error, userDtls, info) => { //eslint-disable-line
    if (error) {
      const err = new APIError('token not matched', httpStatus.INTERNAL_SERVER_ERROR);
      return next(err);
    } else if (userDtls) {
      req.user = userDtls;
      next();
    } else {
      const err = new APIError(`token not matched ${info}`, httpStatus.UNAUTHORIZED);
      return next(err);
    }
  })(req, res, next);
});

router.route('/')
  /** GET /api/users - Get user */
  .get(userCtrl.get)

  /** PUT /api/users - Update user */
  .put(userCtrl.update)

  /** DELETE /api/users - Delete user */
  .delete(userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

router.route('/upload')
/** PUT /api/users/upload - Update user pic */
  .put(userCtrl.upload);
export default router;
