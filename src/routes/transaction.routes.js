const express = require("express")
const authMiddlewareController = require('../middleware/auth.middleware')
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = express.Router()

transactionRoutes.post("/", authMiddlewareController.authMiddleware, transactionController.createTransaction)

transactionRoutes.post("/system/initial-funds", authMiddlewareController.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;