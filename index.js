const express = require('express')
const app = express()
const server = require('http').Server(app)
const config = require('./config').server
const router = require('./network/routes')
const bodyParser = require('body-parser')
const database = require('./db')

app.use(bodyParser.json())

database.connect(() => {
    console.log('[DB] Ready!')
})

router(app)

app.use('/', express.static('public'))
app.use('/experimental', express.static('public/experimental.html'))

server.listen(config.PORT, () => {
    console.log(`Server ready in: ${config.host}:${config.PORT}`)
})