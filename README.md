# FinoEdge - Banking API

Welcome to the FinoEdge backend! This is a secure, easy-to-use REST API for a banking management system built on Node.js and Express.

## What It Does

* **Secure Logins:** Users can sign up, log in, and log out safely. Sessions are kept securely using JWTs stored in cookies, and blacklist tokens when a user logs out so they can't be reused.
* **Efficient Account Creation:** Whenever a user opens an account, the app generates a highly secure, mathematically unique account number using Feistel Ciphers and Luhn Check Digits.
* **Bulletproof Book:** Instead of just changing a "balance" number in the database, a permanent and unchangeable ledger of every single credit and debit is kept. Your balance is calculated live from this ledger, making it totally tamper-proof.
* **Seamless Money Transfers:** Users can send money to other accounts without worrying about accidental double-charges [ thanks to idempotency keys ].
* **Cross-Currency Transfers:** If the accounts use different currencies, the system automatically fetches live exchange rates and converts the money with a processing fee specified. Thanks to [Frankfurter API](https://github.com/lineofflight/frankfurter)
* **Automated Emails:** The system automatically sends a friendly welcome email when they register, plus instant alerts whenever a transaction succeeds or fails.

## Built With

* **Core:** Node.js and Express.js
* **Databases:** MongoDB (with Mongoose)
* **Security & Crypto:** `bcryptjs` for passwords, `jsonwebtoken` for auth, and native crypto tools
* **Infrastructure:** Vercel for deployment

## The API Routes

Here is a quick look at what the API can do:

### Authentication (`/api/auth`)

* `POST /register`: Sign up a new user and send them a welcome email.
* `POST /login`: Log the user in and give them a secure session cookie.
* `POST /logout`: Safely end the session and invalidate the cookie.

### Accounts (`/api/accounts`)

* `POST /`: Open a brand-new bank account for the logged-in user.
* `GET /`: See a list of all the accounts you own. Need to be logged in
* `GET /balance/:accountNumber`: Check the current, mathematically verified balance of a specific account.

### Transactions (`/api/transactions`)

* `POST /`: Send money from your account to someone else's.
* `POST /system/initial-funds`: A special admin-only route used to deposit starting funds into an account.

## Environment Variables

* `PORT` : Port for server to listen
* `MONGO_URI` : Your MongoDB connection string for database access.
* `JWT_SECRET` : A secure string used to sign and verify session tokens for user authentication.
* `CLIENT_ID` : Your Gmail OAuth2 Client ID, used by Nodemailer to authenticate and send emails.
* `CLIENT_SECRET` : Your Gmail OAuth2 Client Secret for the email service.
* `REFRESH_TOKEN` : The OAuth2 Refresh Token that maintains persistent access to the Gmail API for sending automated notifications.
* `EMAIL_USER` : The Gmail address used to authenticate OAuth2 and send system alerts to users.
* `CIPHER_SECRET_KEY` : A numeric secret key used in the Feistel cipher algorithm to generate secure, unique bank account numbers.
* `PROCESSING_FEE` : The percentage fee deducted by the system when converting currencies during cross-currency money transfers.
* `FRONTEND_URLS` : All the allowed URLs to access the system. For multiple address keep the URLs with comma separation and no space after it.

## How to Run It Locally

1. **Set up your environment variables:** Create a `.env` file in the main folder. You'll need to add your database connections (`MONGO_URI`), a few secret keys (`JWT_SECRET`, `CIPHER_SECRET_KEY`), and your Gmail OAuth2 credentials so the app can send emails.
2. **Start the server:** Run the `server.js` file to get everything up and running!
