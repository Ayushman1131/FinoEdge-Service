require('dotenv').config({ override: true, quiet: true })

const cors = require('cors');

const app = require("./src/app")
const connectToDB_mongo = require('./src/config/mongo_db')

const allowedOrigins = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json())

connectToDB_mongo()

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});