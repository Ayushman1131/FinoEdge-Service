const mongoose = require('mongoose')

function connectToDB_mongo() {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to DB")
    })
    .catch(err => {
      console.log("Unable to Connect to DB")
      console.log(`${err.name} : ${err.message}`)
      process.exit(1)
    })
}

module.exports = connectToDB_mongo