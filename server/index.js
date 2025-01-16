const express = require('express')
const app = express()
const dotenv = require('dotenv')
const database = require('./config/db.connect')
const cors = require('cors')
const cookieParser = require('cookie-parser')

dotenv.config()
const PORT = 3000 || process.env.PORT

database.connect();

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser());

app.use(
	cors({
		origin:"http://localhost:3000",
		credentials:true,
	})
)

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})