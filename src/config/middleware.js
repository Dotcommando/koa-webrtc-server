import koaCompress from 'koa-compress'
import koaHelmet from 'koa-helmet'
import cors from 'koa2-cors'
import bodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import morgan from 'koa-morgan'
import errorHandler from './error-handler'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export default app => {
    if (isProd) {
        app.use(koaCompress())
        app.use(koaHelmet())
    }

    app.use(errorHandler)
    app.use(
        cors({
            origin: [ 'http://localhost:4200', 'http://localhost:8080', ],
        })
    )
    app.use(bodyParser())
    app.use(passport.initialize())

    if (isDev) {
        app.use(morgan('dev'))
    }
}
