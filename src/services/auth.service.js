import passport from 'koa-passport'
import LocalStrategy from 'passport-local'
import { Strategy as JWTStrategy, ExtractJwt, } from 'passport-jwt'
import HTTPStatus from 'http-status'

import User from '../modules/users/user.model'
import constants from '../config/constants'

// Local Strategy
const localOpts = {
    usernameField: 'email',
}

/**
 * Авторизация как по e-mail, так и по userName.
 * @type {Strategy}
 */
const localStrategy = new LocalStrategy(
    localOpts,
    async (email, password, done) => {
        try {
            const criteria =
                        email.indexOf('@') === -1 ? { userName: email, } : { email, }
            const user = await User.findOne(criteria).populate({
                path: 'roles',
                populate: { path: 'permissions', },
            })
            if (!user) {
                return done(null, false, {
                    message: 'User not found.',
                    status: 'Failed',
                })
            } else if (!user.authenticateUser(password)) {
                return done(null, false, {
                    message: 'Password is wrong.',
                    status: 'Failed',
                })
            }
            return done(null, user)
        } catch (err) {
            return done(err, false, {
                message: 'Authorization is failed. Something went wrong.',
                status: 'Failed',
            })
        }
    },
)

// JWT Strategy
const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: constants.JWT_SECRET,
}

const jwtStrategy = new JWTStrategy(jwtOpts, async (payload, done) => {
    try {
        const user = await User.findById(payload._id).populate({
            path: 'roles',
            populate: { path: 'permissions', },
        })
        if (!user) {
            return done(null, false, {
                message: 'User not found.',
                status: 'Failed',
            })
        }
        return done(null, user)
    } catch (err) {
        return done(err, false, {
            message: 'Authorization is failed. Something went wrong.',
            status: 'Failed',
        })
    }
})

passport.use(localStrategy)
passport.use(jwtStrategy)
passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user.userName)
    })
})

export const authLocal = async function (ctx) {
    return passport.authenticate(
        'local',
        { session: false, },
        (err, user, info, status) => {
            if (user === false) {
                ctx.throw(HTTPStatus.UNAUTHORIZED)
            } else {
                ctx.body = { success: true, user: user.toAuthJSON(), }
                return ctx.login(user)
            }
        }
    )(ctx)
}

export const authJwt = async function (ctx, next) {
    return passport.authenticate(
        'jwt',
        { session: false, },
    )(ctx, next)
}
