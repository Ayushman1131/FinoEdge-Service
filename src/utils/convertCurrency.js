require("dotenv").config()

async function getExchangeRate(base, quote) {
  const api = "https://api.frankfurter.dev";
  return fetch(`${api}/v2/rate/${base}/${quote}`)
    .then((r) => r.json())
    .then((d) => (d.rate).toFixed(4));
}

async function convertCurrency(exchangeRate, amount) {
  const convertedAmount = (exchangeRate * amount - (amount * (process.env.PROCESSING_FEE / 100))).toFixed(2)
  return convertedAmount
}

module.exports = { convertCurrency, getExchangeRate }