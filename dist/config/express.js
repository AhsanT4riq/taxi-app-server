'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressValidation = require('express-validation');

var _expressValidation2 = _interopRequireDefault(_expressValidation);

var _expressWinston = require('express-winston');

var _expressWinston2 = _interopRequireDefault(_expressWinston);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _APIError = require('../server/helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _env = require('./env');

var _env2 = _interopRequireDefault(_env);

var _routes = require('../server/routes');

var _routes2 = _interopRequireDefault(_routes);

var _winston = require('./winston');

var _winston2 = _interopRequireDefault(_winston);

var _passportConfig = require('./passport-config');

var _passportConfig2 = _interopRequireDefault(_passportConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = require('http').createServer(app);

if (_env2.default.env === 'development') {}
// app.use(logger('dev'));


// parse body params and attache them to req.body
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

app.use((0, _cookieParser2.default)());
app.use((0, _compression2.default)());
app.use((0, _methodOverride2.default)());

// configure passport for authentication
(0, _passportConfig2.default)(_passport2.default);
app.use(_passport2.default.initialize());

// secure apps by setting various HTTP headers
app.use((0, _helmet2.default)());

// enable CORS - Cross Origin Resource Sharing
app.use((0, _cors2.default)());

// enable detailed API logging in dev env
if (_env2.default.env === 'development') {
  _expressWinston2.default.requestWhitelist.push('body');
  _expressWinston2.default.responseWhitelist.push('body');
}

// mount public folder on / path
app.get('/', function (req, res) {
  res.sendFile(_path2.default.resolve(__dirname, '../../public/index.html'));
});

// mount all routes on /api path
app.use('/api', _routes2.default);

// if error is not an instanceOf APIError, convert it.
app.use(function (err, req, res, next) {
  if (err instanceof _expressValidation2.default.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    var unifiedErrorMessage = err.errors.map(function (error) {
      return error.messages.join('. ');
    }).join(' and ');
    var error = new _APIError2.default(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof _APIError2.default)) {
    var apiError = new _APIError2.default(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new _APIError2.default('API not found', _httpStatus2.default.NOT_FOUND);
  return next(err);
});

// log error in winston transports except when executing test suite
if (_env2.default.env !== 'test') {
  app.use(_expressWinston2.default.errorLogger({
    winstonInstance: _winston2.default
  }));
}

// error handler, send stacktrace only during development
app.use(function (err, req, res, next) {
  return (//eslint-disable-line
    res.status(err.status).json({
      success: false,
      message: err.isPublic ? err.message : _httpStatus2.default[err.status],
      stack: _env2.default.env === 'development' ? err.stack : {}
    })
  );
});

exports.default = server;
module.exports = exports['default'];
//# sourceMappingURL=express.js.map
