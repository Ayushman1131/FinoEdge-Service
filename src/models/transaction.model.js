const mongoose = require('mongoose')


const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with From Account"],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with To Account"],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      messages: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
    },
    default: "PENDING"
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required for creating a transaction'],
    min: [0, "Transaction amount cannot be negative"]
  },
  idempotencyKey: {
    type: String,
    required: [true, "Idempotency Key is required for creating a transaction"],
    index: true,
    unique: true
  },
  currency: {
    type: String,
    required: [true, "Transaction currency is required"]
  },
  exchangeRate: {
    type: Number,
    required: false
  },
  targetCurrency: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel