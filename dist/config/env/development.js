"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  env: "development",
  jwtSecret: "0a6b944d-d2fb-46fc-a85e-0295c986cd9f",
  db: "mongodb://localhost/taxiApp-development",
  port: 3020,
  passportOptions: {
    session: false
  },
  radius: 20 / 6378, // where 20 Kms is used as radius to find nearby driver
  arrivedDistance: 200,
  arrivingDistance: 1000,
  limit: 10,
  skip: 0,
  tripFilter: "All"
};
module.exports = exports["default"];
//# sourceMappingURL=development.js.map
