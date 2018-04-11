'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var TransactionSchema = new Schema({
  userIdTo: { type: Schema.Types.ObjectId, ref: 'User' },
  userIdFrom: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, default: null },
  tripId: { type: Schema.Types.ObjectId, ref: 'trip', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

exports.default = _mongoose2.default.model('Transaction', TransactionSchema);
module.exports = exports['default'];
//# sourceMappingURL=transaction.js.map
