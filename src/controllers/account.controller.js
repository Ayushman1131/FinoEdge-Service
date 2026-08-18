const { accountModel, accountCounter } = require('../models/account.model');

const { generateAccountNumber } = require('../utils/accountNumberGenerator');

async function createAccount(req, res) {
  const user = req.user;
  const { currency } = req.body;

  const counterDoc = await accountCounter.findOneAndUpdate(
    { _id: 'bank_account_sequence' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const secureAccountNumber = generateAccountNumber(counterDoc.seq);

  const account = await accountModel.create({
    user: user._id,
    accountNumber: secureAccountNumber,
    currency: currency
  });

  res.status(201).json({
    account: {
      ...account.toObject(),
      accountNumber: account.accountNumber.toString()
    }
  });
}

async function getUserAccounts(req, res) {

  const accounts = await accountModel.find({ user: req.user._id });

  const jsonResponse = JSON.stringify({ accounts }, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );

  res.status(200).type('json').send(jsonResponse);
}

async function getAccountBalance(req, res) {
  const { accountNumber } = req.params;

  const account = await accountModel.findOne({
    accountNumber: accountNumber,
    user: req.user._id
  })

  if (!account) {
    return res.status(404).json({
      message: "Account not found"
    })
  }

  const balance = await account.getBalance();

  res.status(200).json({
    accountNumber: accountNumber,
    balance: balance
  })
}


module.exports = {
  createAccount,
  getUserAccounts,
  getAccountBalance
}