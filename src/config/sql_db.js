const sql = require("postgres")

let connection = null

function connectToDB_sql() {
  if (!connection) {
    connection = sql(process.env.SQL_URI)
    console.log("Connection to DB initialized at port 5431")
    return sql
  }
  else {
    console.log("Failed to intiate DB Connection")
    process.exit(1)
  }
}

module.exports = connectToDB_sql