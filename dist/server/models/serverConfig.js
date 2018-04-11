'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
/**
 * AppConfig Schema
 */
var ServerConfigSchema = new _mongoose2.default.Schema({
  type: { type: Schema.Types.Mixed },
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed }
});

exports.default = _mongoose2.default.model('ServerConfig', ServerConfigSchema);
module.exports = exports['default'];
//# sourceMappingURL=serverConfig.js.map
