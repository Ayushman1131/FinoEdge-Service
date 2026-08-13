require('dotenv').config({ override: true, quiet: true })

const app = require("./src/app")
const connectToDB_sql = require('./src/config/sql_db')
const connectToDB_mongo = require('./src/config/mongo_db')

connectToDB_mongo()

app.listen(3001, () => {
  console.log("Server intiated at port 3001")
})