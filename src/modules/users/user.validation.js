/* eslint-disable no-param-reassign */
// import _ from 'lodash'

import User from './user.model'

export const passwordReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/
export const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

export function checkUserID (msg) {
    return async function (req, res, next) {
        const errorResponse = {
            message: msg,
            status: 'Failed',
            errors: [],
        }

        const user = await User.findById(req.params.id)
            .populate({ path: 'roles', populate: { path: 'permissions', }, })
            .catch(() => {
                errorResponse.errors.push(`User id ${req.params.id} is invalid.`)
            })
        if (!user) {
            res.statusCode = 404
            errorResponse.errors.push(`User with id ${req.params.id} not found.`)
            return res.json(errorResponse)
        }

        req._user = user

        return next()
    }
}

export async function signUp (req, res, next) {
    let errorResponse = {
        message: 'User data has errors.',
        status: 'Failed',
        errors: [],
    }

    let errStatus = 400

    let hasAnyError = false

    if (typeof req.body.email === 'string') {
        if (!emailRegex.test(req.body.email)) {
            hasAnyError = true
            errorResponse.errors.push(`Email invalid.`)
        } else {
            let registeredEmail = await User.findOne({ email: req.body.email, }).catch(
                () => new Error('Can not check if user email is registered.'),
            )
            if (registeredEmail) {
                hasAnyError = true
                errStatus = 409
                errorResponse.errors.push(`Email already registered.`)
            }
        }
    } else {
        hasAnyError = true
        errorResponse.errors.push(`Email is not a string or missed.`)
    }

    if (typeof req.body.userName === 'string') {
        if (req.body.userName === '') {
            hasAnyError = true
            errorResponse.errors.push(`Username can not be equal empty string.`)
        } else {
            let notUniqueUserName = await User.findOne({
                userName: req.body.userName,
            }).catch(() => new Error('Can not check if username is used.'))
            if (notUniqueUserName) {
                hasAnyError = true
                errStatus = 409
                errorResponse.errors.push(`Username already used.`)
            }
        }
    } else {
        hasAnyError = true
        errorResponse.errors.push(`Username is not a string or missed.`)
    }

    if ('firstName' in req.body) {
        if (typeof req.body.firstName !== 'string') {
            hasAnyError = true
            errorResponse.errors.push(`First name is not a string.`)
        }
    } else {
        hasAnyError = true
        errorResponse.errors.push(`First name required.`)
    }

    if ('lastName' in req.body) {
        if (typeof req.body.lastName !== 'string') {
            hasAnyError = true
            errorResponse.errors.push(`Last name is not a string.`)
        }
    } else {
        hasAnyError = true
        errorResponse.errors.push(`Last name required.`)
    }

    if (!req.body.password || typeof req.body.password !== 'string') {
        hasAnyError = true
        errorResponse.errors.push(`Password missed or not a string.`)
    } else {
        if (req.body.password.length < 6) {
            hasAnyError = true
            errorResponse.errors.push(`Password must be longer 6 symbols.`)
        } else {
            if (!passwordReg.test(req.body.password)) {
                hasAnyError = true
                errorResponse.errors.push(
                    `Password must contains at least one lowercase letter, one uppercase letter and one number.`,
                )
            }
        }
    }

    if (hasAnyError) {
        res.statusCode = errStatus
        return res.json(errorResponse)
    }

    return next()
}

export function login (req, res, next) {
    let errorResponse = {
        message: 'Login data has errors.',
        status: 'Failed',
        errors: [],
    }

    let errStatus = 401

    let hasAnyError = false

    if (!('email' in req.body)) {
        hasAnyError = true
        errorResponse.errors.push(`Email or userName is required for login.`)
    } else if (typeof req.body.email !== 'string') {
        hasAnyError = true
        errorResponse.errors.push(`Email or userName must be a string.`)
    }

    if (!('password' in req.body)) {
        hasAnyError = true
        errorResponse.errors.push(`Password missed.`)
    } else if (typeof req.body.password !== 'string') {
        hasAnyError = true
        errorResponse.errors.push(`Password must be a string.`)
    }

    if (hasAnyError) {
        res.statusCode = errStatus
        return res.json(errorResponse)
    }

    return next()
}

export function getUsersList (req, res, next) {
    if (!req.query.skip) {
        req.query.skip = 0
    } else if (!parseInt(req.query.skip, 10)) {
        req.query.skip = 0
    }

    if (!req.query.limit) {
        req.query.limit = 0
    } else if (!parseInt(req.query.limit, 10)) {
        req.query.limit = 0
    }

    return next()
}

export async function updateUser (req, res, next) {
    let errorResponse = {
        message: 'User data has errors.',
        status: 'Failed',
        errors: [],
    }

    let errStatus = 400

    let hasAnyError = false

    if ('roles' in req.body) {
        hasAnyError = true
        errorResponse.errors.push(
            `Roles updates in request for user update are deprecated.`,
        )
    }

    if ('email' in req.body) {
        if (typeof req.body.email === 'string') {
            if (!emailRegex.test(req.body.email)) {
                hasAnyError = true
                errorResponse.errors.push(`Email invalid.`)
            } else {
                let registeredEmail = await User.findOne({
                    email: req.body.email,
                }).catch(() => new Error('Can not check if user email is registered.'))
                if (registeredEmail && registeredEmail._id.toJSON() !== req.params.id) {
                    hasAnyError = true
                    errStatus = 409
                    errorResponse.errors.push(
                        `Email already registered with another user name.`,
                    )
                }
            }
        } else {
            hasAnyError = true
            errorResponse.errors.push(`Email must be a string.`)
        }
    }

    if ('userName' in req.body) {
        if (typeof req.body.userName === 'string') {
            let notUniqueUserName = await User.findOne({
                userName: req.body.userName,
            }).catch(() => new Error('Can not check if userName is used.'))
            if (notUniqueUserName && notUniqueUserName._id !== req.params.id) {
                hasAnyError = true
                errStatus = 409
                errorResponse.errors.push(`Username already used.`)
            }
            if (req.body.userName.length < 2) {
                hasAnyError = true
                errorResponse.errors.push(`Username must be longer 2 symbols.`)
            }
        } else {
            hasAnyError = true
            errorResponse.errors.push(`Username must be a string.`)
        }
    }

    if ('firstName' in req.body) {
        if (typeof req.body.firstName !== 'string') {
            hasAnyError = true
            errorResponse.errors.push(`First name is not a string.`)
        }
    }

    if ('lastName' in req.body) {
        if (typeof req.body.lastName !== 'string') {
            hasAnyError = true
            errorResponse.errors.push(`Last name is not a string.`)
        }
    }

    if ('password' in req.body) {
        if (typeof req.body.password === 'string') {
            if (req.body.password.length < 6) {
                hasAnyError = true
                errorResponse.errors.push(`Password must be longer 6 symbols.`)
            } else {
                if (!passwordReg.test(req.body.password)) {
                    hasAnyError = true
                    errorResponse.errors.push(
                        `Password must contains at least one lowercase letter, one uppercase letter and one number.`,
                    )
                }
            }
        } else {
            hasAnyError = true
            errorResponse.errors.push(`Password must be a string.`)
        }
    }

    if (hasAnyError) {
        res.statusCode = errStatus
        return res.json(errorResponse)
    }

    return next()
}

export async function checkRoles (req, res, next) {
    let errorResponse = {
        message: 'User data for updates has errors.',
        status: 'Failed',
        errors: [],
    }

    const arrayCheck = checkRolesArray(req.body.roles, errorResponse)
    errorResponse = arrayCheck[0]
    let hasAnyError = arrayCheck[1]

    if (hasAnyError) {
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

function checkRolesArray (array, errorResponse) {
    let hasAnyError = false

    if (!_.isArray(array)) {
        errorResponse.errors.push('Roles are not array.')
        return [ errorResponse, true, ]
    }

    const len = array.length

    for (let i = 0; i < len; i++) {
        const current = array[i]
        if (typeof current !== 'string') {
            errorResponse.errors.push('One of roles is not a string.')
            hasAnyError = true
            break
        }
        if (current.length === 0) {
            errorResponse.errors.push('One of roles has 0 letters length.')
            hasAnyError = true
            break
        }
        if (current.length < 3) {
            errorResponse.errors.push('Onу of roles contains less than 3 symbols.')
            hasAnyError = true
            break
        }
    }

    return [ errorResponse, hasAnyError, ]
}
