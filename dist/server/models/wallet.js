'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var WalletSchema = new Schema({
  userEmail: { type: String, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userType: { type: String, default: 'rider' },
  stripeAccountId: { type: String, default: null },
  walletBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

exports.default = _mongoose2.default.model('Wallet', WalletSchema);
module.exports = exports['default'];
//# sourceMappingURL=wallet.js.map
