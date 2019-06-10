import Koa from 'koa'
import io from 'socket.io-client'
import middleware from './config/middleware'
import constants from './config/constants'
import apiRoutes from './modules'
import './config/database'

const app = new Koa()
middleware(app)
apiRoutes(app)

app.listen(constants.PORT, function () {
    console.log(`Koa WebRTC Server is listening on port ${constants.PORT}.`)
})
