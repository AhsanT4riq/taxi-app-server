'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _appConfig = require('../models/appConfig');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _APIError = require('../helpers/APIError');

var _APIError2 = _interopRequireDefault(_APIError);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//eslint-disable-line

function getConfig(req, res, next) {
  _appConfig2.default.find(function (error, configData) {
    //eslint-disable-line
    if (error) {
      var err = new _APIError2.default('error while finding version number for the user  ' + error, _httpStatus2.default.INTERNAL_SERVER_ERROR);
      return next(err);
    }
    var configObj = {};
    _lodash2.default.map(configData, function (keyData) {
      configObj[keyData.key] = keyData.value;
    });
    res.send(configObj);
  });
}

function updateVersion(next) {
  return new Promise(function (resolve, reject) {
    _appConfig2.default.findOneAsync({ key: 'version' }).then(function (foundKey) {
      if (foundKey !== null) {
        var prevValue = foundKey.value;
        var newVersion = prevValue + 1;
        _appConfig2.default.findOneAndUpdateAsync({ key: 'version' }, { $set: { value: newVersion, type: 'Number' } }, { new: true }).then(function (updatedVersion) {
          if (updatedVersion) {
            resolve(updatedVersion);
          }
        }).error(function (e) {
          var err = new _APIError2.default('error in updating user details while login ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
          next(err);
        });
      } else {
        var newVersionConfig = new _appConfig2.default({
          type: 'Number',
          key: 'version',
          value: 1
        });
        newVersionConfig.saveAsync().then(function (savedVersionConfigObj) {
          resolve(savedVersionConfigObj);
        }).error(function (e) {
          return reject(e);
        });
      }
    });
  });
}

function updateConfig(req, res, next) {
  var reqObj = Object.assign({}, req.body);
  var result = [];
  var keys = _lodash2.default.keys(reqObj);
  var values = _lodash2.default.values(reqObj);
  _lodash2.default.map(keys, function (keyitem, index) {
    _appConfig2.default.findOneAsync({ key: keyitem }).then(function (foundKey) {
      if (foundKey !== null) {
        if (foundKey.value !== values[index]) {
          _appConfig2.default.findOneAndUpdateAsync({ key: keyitem }, { $set: { value: values[index] } }, { new: true }).then(function (updatedConfigObj) {
            if (updatedConfigObj) {
              result.push(updatedConfigObj);
              if (result.length === keys.length) {
                updateVersion(next).then(function (versionConfig) {
                  result.push(versionConfig);
                  res.send(result);
                });
              }
            }
          }).error(function (e) {
            var err = new _APIError2.default('error in updating user details while login ' + e, _httpStatus2.default.INTERNAL_SERVER_ERROR);
            next(err);
          });
        } else {
          result.push(foundKey);
          if (result.length === keys.length) {
            res.send(result);
          }
        }
      } else {
        var newConfig = new _appConfig2.default({
          type: _typeof(values[index]),
          key: keyitem,
          value: values[index]
        });
        newConfig.saveAsync().then(function (savedConfigObj) {
          result.push(savedConfigObj);
          if (result.length === keys.length) {
            res.send(result);
          }
        }).error(function (e) {
          return next(e);
        });
      }
    });
  });
}
function getConfigVersion(req, res, next) {
  _appConfig2.default.find(function (error, configData) {
    //eslint-disable-line
    if (error) {
      var err = new _APIError2.default('error while finding version number for the user  ' + error, _httpStatus2.default.INTERNAL_SERVER_ERROR);
      return next(err);
    }
    var returnObj = {
      success: true,
      message: 'config version number',
      data: configData.version
    };
    res.send(returnObj);
  });
}

exports.default = { getConfigVersion: getConfigVersion, getConfig: getConfig, updateConfig: updateConfig };
module.exports = exports['default'];
//# sourceMappingURL=appConfig.js.map
