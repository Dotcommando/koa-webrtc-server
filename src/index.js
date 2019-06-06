import Koa from 'koa'
import io from 'socket.io-client'
import middleware from './config/middleware'
import constants from './config/constants'

const app = new Koa()
middleware(app)

app.listen(constants.PORT, function () {
    console.log('Koa WebRTC Server is listening on port', constants.PORT)
})
