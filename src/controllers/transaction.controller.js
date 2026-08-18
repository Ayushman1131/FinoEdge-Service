const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const { accountModel } = require("../models/account.model")
const emailService = require("../services/email.service")
const { convertCurrency, getExchangeRate } = require("../utils/convertCurrency")
const mongoose = require("mongoose")

async function createTransaction(req, res) {


  const { fromAccount, toAccount, amount, idempotencyKey } = req.body

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotencyKey are required"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  }).populate("user")

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  }).populate("user")

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount"
    })
  }


  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  })

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists
      })
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({ message: "Transaction is still processing" })
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({ message: "Transaction processing failed, please retry" })
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({ message: "Transaction was reversed, please retry" })
    }
  }


  if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
    })
  }


  const preTransactionBalance = await fromUserAccount.getBalance()

  if (preTransactionBalance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${fromUserAccount.currency} ${preTransactionBalance}. Requested amount is ${fromUserAccount.currency} ${amount}`
    })
  }

  let exchangeRate = null
  let convertedAmount = null

  if (fromUserAccount.currency !== toUserAccount.currency) {
    exchangeRate = await getExchangeRate(fromUserAccount.currency, toUserAccount.currency)
    convertedAmount = await convertCurrency(exchangeRate, amount)
    console.log(exchangeRate, convertedAmount)
  } else {
    exchangeRate = 1.0
  }

  let transaction;
  try {

    const session = await mongoose.startSession()
    session.startTransaction()

    transaction = (await transactionModel.create([{
      fromAccount,
      toAccount,
      amount: convertedAmount ?? amount,
      currency: fromUserAccount.currency,
      exchangeRate,
      targetCurrency: toUserAccount.currency,
      idempotencyKey,
      status: "PENDING"
    }], { session }))[0]

    // DebitLedger
    await ledgerModel.create([{
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT"
    }], { session })

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })()

    // Credit Ledger
    await ledgerModel.create([{
      account: toAccount,
      amount: convertedAmount ?? amount,
      transaction: transaction._id,
      type: "CREDIT"
    }], { session })


    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session }
    )


    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    return res.status(400).json({
      message: "Transaction is Pending due to some issue, please retry after sometime",
    })
  }


  const fromUpdatedBalance = await fromUserAccount.getBalance();
  const toUpdatedBalance = await toUserAccount.getBalance();

  const txDate = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  if (fromUserAccount.user) {
    const fromEmailData = {
      userName: fromUserAccount.user.user_name,
      email: fromUserAccount.user.email,
      transactionType: "Debit",
      amount: amount,
      currency: fromUserAccount.currency,
      accountNumber: `****${fromUserAccount.accountNumber.toString().slice(-4)}`,
      dateTime: txDate,
      availableBalance: fromUpdatedBalance,
      referenceNo: transaction._id.toString()
    };

    emailService.sendTransactionEmail(fromEmailData).catch(err => console.error(err));
  }

  if (toUserAccount.user) {
    const toEmailData = {
      userName: toUserAccount.user.user_name,
      email: toUserAccount.user.email,
      transactionType: "Credit",
      amount: amount,
      currency: toUserAccount.currency,
      accountNumber: `****${toUserAccount.accountNumber.toString().slice(-4)}`,
      dateTime: txDate,
      availableBalance: toUpdatedBalance,
      referenceNo: transaction._id.toString()
    };

    emailService.sendTransactionEmail(toEmailData).catch(err => console.error(err));
  }

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction
  })
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required"
    })
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  }).populate("user")

  if (!toUserAccount) {
    return res.status(400).json({ message: "Invalid toAccount" })
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id
  }).populate("user")

  if (!fromUserAccount) {
    return res.status(400).json({ message: "System user account not found" })
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    currency: fromUserAccount.currency,
    idempotencyKey,
    status: "PENDING"
  })

  await ledgerModel.create([{
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }], { session })

  await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"
  }], { session })

  transaction.status = "COMPLETED"
  await transaction.save({ session })

  await session.commitTransaction()
  session.endSession()


  const fromUpdatedBalance = await fromUserAccount.getBalance();
  const toUpdatedBalance = await toUserAccount.getBalance();

  const txDate = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  if (fromUserAccount.user) {
    const fromEmailData = {
      userName: fromUserAccount.user.user_name,
      email: fromUserAccount.user.email,
      transactionType: "Debit",
      amount: amount,
      currency: fromUserAccount.currency,
      accountNumber: `****${fromUserAccount.accountNumber.toString().slice(-4)}`,
      dateTime: txDate,
      availableBalance: fromUpdatedBalance,
      referenceNo: transaction._id.toString()
    };
    emailService.sendTransactionEmail(fromEmailData).catch(err => console.error(err));
  }

  if (toUserAccount.user) {
    const toEmailData = {
      userName: toUserAccount.user.user_name,
      email: toUserAccount.user.email,
      transactionType: "Credit",
      amount: amount,
      currency: toUserAccount.currency,
      accountNumber: `****${toUserAccount.accountNumber.toString().slice(-4)}`,
      dateTime: txDate,
      availableBalance: toUpdatedBalance,
      referenceNo: transaction._id.toString()
    };
    emailService.sendTransactionEmail(toEmailData).catch(err => console.error(err));
  }

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction
  })
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction
}