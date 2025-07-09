const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config() 
const port = process.env.PORT
const connectDB = require('./config/db')
const Apirouter = require('./routes/index')

// cookie-parser
const cookieParser = require('cookie-parser')

app.get('/', (req, res) => {
  res.send('Hello World!')
})
const clientUrl = process.env.CLIENT_DOMAIN
const clientProdUrl = process.env.PROD_CLIENT_DOMAIN
app.use(cors({
  origin:[clientUrl,clientProdUrl],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())


app.use('/api', Apirouter)  

connectDB()
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
