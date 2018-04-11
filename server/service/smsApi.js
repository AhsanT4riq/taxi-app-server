import Twilio from 'twilio';
import ServerConfig from '../models/serverConfig';
import UserSchema from '../models/user';

function getSmsApiDetails() {
  return new Promise((resolve, reject) => {
    ServerConfig.findOneAsync({ key: 'smsConfig' })
      .then((foundDetails) => {
        resolve(foundDetails.value);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function sendSms(userId, smsText) {
  UserSchema.findOneAsync({ _id: userId }).then((userObj) => {
    getSmsApiDetails().then((details) => {
      const twilio = new Twilio(details.accountSid, details.token);
      twilio.messages.create(
        {
          from: details.from,
          to: userObj.phoneNo,
          body: smsText
        },
        (err, result) => {
          if (err) {
            return err;
          }
          return result;
        }
      );
    });
  });
}
export default sendSms;
