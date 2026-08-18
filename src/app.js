/**
 * - Import modules
 */
const express = require("express")
const cookieParser = require('cookie-parser')

/**
 * - Import routes
 */

const authRouter = require('./routes/auth.routes')
const accountRouter = require('./routes/account.routes')
const transactionRouter = require('./routes/transaction.routes')

/**
 * - Server intiation
 */
const app = express()

/**
 * - Module use
 */
app.use(express.json())
app.use(cookieParser())

/**
 * - Router use
 */
app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)
app.use('/api/transactions', transactionRouter)

app.get("/", (req, res) => {
  res.send("FinoEdge Service is up and running")
})

module.exports = app