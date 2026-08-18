require('dotenv').config({ override: true, quiet: true })

const app = require("./src/app")
const connectToDB_mongo = require('./src/config/mongo_db')

connectToDB_mongo()

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});