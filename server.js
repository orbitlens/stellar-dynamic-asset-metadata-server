const express = require('express'),
    logger = require('morgan'),
    compression = require('compression'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    http = require('http')

//express server app
const app = express()
app.disable('x-powered-by')
//allow using service behind the local reverse proxy (haproxy, nginx)
app.set('trust proxy', 'loopback')

//middleware
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

//register router
require('./api/asset-meta-api')(app)

// error handler
app.use((err, req, res, next) => {
    if (err) console.error(err)
    res.status(500).end()
})

//use server port from the PORT environment variable or 3000 port by default
function normalizePort(val) {
    let port = parseInt(val)
    if (isNaN(port)) return val
    if (port >= 0) return port
    return false
}
const serverPort = normalizePort(process.env.PORT || '3000')
app.set('port', serverPort)

//create HTTP listener
const server = http.createServer(app)
server.listen(serverPort)
server.on('listening', function () {
    const addr = server.address(),
        bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    console.log('Listening on ' + bind)
})