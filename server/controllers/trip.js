import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import { fetchReturnObj } from '../service/transform-response';
import TripSchema from '../models/trip';

/**
 * Return the trip details of the user.
 * @param req
 * @param res
 * @param next
 * @returns { trip: historyObjArray[{ tripObj }]  }
 */

function getHistory(req, res, next) {
  const historyObjArray = [];
  const userID = req.user._id; //eslint-disable-line
  const userType = req.user.userType;
  const searchObj = {};
  if (userType === 'rider') {
    searchObj.riderId = userID;
  } else if (userType === 'driver') {
    searchObj.driverId = userID;
  }
  TripSchema.find({ $and: [searchObj, { tripStatus: 'endTrip' }] }, null, {sort: {bookingTime: -1}} ,(tripErr, tripObj) => { //eslint-disable-line
    if (tripErr) {
      const err = new APIError(`error while finding trip history for the user  ${tripErr}`, httpStatus.INTERNAL_SERVER_ERROR);
      return next(err);
    }
    if (tripObj.length !== 0) {
      tripObj.forEach((obj, index) => {
        fetchReturnObj(obj).then((transformedReturnObj) => {
          historyObjArray.push(transformedReturnObj);
          if (index === tripObj.length - 1) {
            const returnObj = {
              success: true,
              message: 'user trip history',
              data: historyObjArray
            };
            res.send(returnObj);
          }
        });
      });
    } else {
      const returnObj = {
        success: true,
        message: 'no history available',
        data: []
      };
      res.send(returnObj);
    }
  });
}

export default { getHistory };
