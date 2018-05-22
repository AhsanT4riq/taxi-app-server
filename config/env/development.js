export default {
  env: 'development',
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  // db: "mongodb://localhost/taxiApp-development",
  db: 'mongodb://shesafetest:ETUT0ZCLlxRlykUk@shesafetest-shard-00-00-jgxby.mongodb.net:27017,shesafetest-shard-00-01-jgxby.mongodb.net:27017,shesafetest-shard-00-02-jgxby.mongodb.net:27017/test?ssl=true&replicaSet=SheSafeTest-shard-0&authSource=admin',
  port: 3020,
  passportOptions: {
    session: false
  },
  radius: 20 / 6378, // where 20 Kms is used as radius to find nearby driver
  arrivedDistance: 200,
  arrivingDistance: 1000,
  limit: 10,
  skip: 0,
  tripFilter: 'All'
};
