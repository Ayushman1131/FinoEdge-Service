const express = require('express')
const authMiddlewareController = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

router.post("/", authMiddlewareController.authMiddleware, accountController.createAccount)

router.get("/", authMiddlewareController.authMiddleware, accountController.getUserAccounts)

router.get("/balance/:accountNumber", authMiddlewareController.authMiddleware, accountController.getAccountBalance)

module.exports = router