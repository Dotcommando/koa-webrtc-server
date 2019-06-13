/* eslint-disable no-param-reassign */
import _ from 'lodash'

import Role from './role.model'

export async function validatePermissions (req, res, next) {
    let errorResponse = {
        message: 'Permissions in request have mistakes.',
        status: 'Failed',
        errors: [],
    }

    if (!req.body.permissions || !_.isArray(req.body.permissions)) {
        errorResponse.errors.push("Permissions are not array or doesn't exist.")
        res.statusCode = 400
        return res.json(errorResponse)
    }

    // if (req.body.permissions.length === 0) {
    //   errorResponse.errors.push('Permissions array has no elements.');
    //   res.statusCode = 400;
    //   return res.json(errorResponse);
    // }

    const checkResult = checkPermissionsArray(
        req.body.permissions,
        errorResponse,
    )
    errorResponse = checkResult[0]
    let hasAnyError = checkResult[1]

    if (hasAnyError) {
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

export async function createRole (req, res, next) {
    let errorResponse = {
        message: 'Request for create role is invalid.',
        status: 'Failed',
        errors: [],
    }

    const checkName = await checkPermissionsName(req.body.name, errorResponse)

    errorResponse = checkName[0]
    let hasAnyError = checkName[1]
    let errStatus = checkName[2]

    if (hasAnyError) {
        res.statusCode = errStatus
        return res.json(errorResponse)
    }

    return next()
}

export async function getRolesList (req, res, next) {
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

export async function renameRole (req, res, next) {
    let errorResponse = {
        message: 'Request for rename role is invalid.',
        status: 'Failed',
        errors: [],
    }

    const role = await Role.findById(req.params.id)
        .populate('permissions')
        .catch(() => {
            errorResponse.errors.push(`Role id ${req.params.id} is invalid.`)
        })
    if (!role) {
        res.statusCode = 404
        errorResponse.errors.push(`Role with id ${req.params.id} not found.`)
        return res.json(errorResponse)
    }

    req._role = role

    const checkName = await checkPermissionsName(req.body.name, errorResponse)

    errorResponse = checkName[0]
    let hasAnyError = checkName[1]
    let errStatus = checkName[2]

    if (hasAnyError) {
        res.statusCode = errStatus
        return res.json(errorResponse)
    }

    return next()
}

export function checkRoleID (msg) {
    return async function (req, res, next) {
        const errorResponse = {
            message: msg,
            status: 'Failed',
            errors: [],
        }

        const role = await Role.findById(req.params.id)
            .populate('permissions')
            .catch(() => {
                errorResponse.errors.push(`Role id ${req.params.id} is invalid.`)
            })
        if (!role) {
            res.statusCode = 404
            errorResponse.errors.push(`Role with id ${req.params.id} not found.`)
            return res.json(errorResponse)
        }

        req._role = role

        return next()
    }
}

function checkPermissionsArray (array, errorResponse) {
    let hasAnyError = false
    const len = array.length

    for (let i = 0; i < len; i++) {
        const current = array[i]
        if (!_.isArray(current)) {
            errorResponse.errors.push('One of permissions is not an array.')
            hasAnyError = true
            break
        }
        if (current.length === 0) {
            errorResponse.errors.push('One of permissions has no elements.')
            hasAnyError = true
            break
        }
        if (current.length < 2) {
            errorResponse.errors.push(
                'In one of permissions missed action or subject.',
            )
            hasAnyError = true
            break
        }
        if (typeof current[0] !== 'string') {
            errorResponse.errors.push('One of actions in permissions not a string.')
            hasAnyError = true
            break
        }
        if (typeof current[1] !== 'string') {
            errorResponse.errors.push('One of subjects in permissions not a string.')
            hasAnyError = true
            break
        }
        if (current[0].length < 3) {
            errorResponse.errors.push(
                'One of actions in permissions less than 3 symbols.',
            )
            hasAnyError = true
            break
        }
        if (current[1].length < 3) {
            errorResponse.errors.push(
                'One of subjects in permissions less than 3 symbols.',
            )
            hasAnyError = true
            break
        }
    }

    return [ errorResponse, hasAnyError, ]
}

async function checkPermissionsName (name, errorResponse) {
    let hasAnyError = false
    let errStatus = 400

    if (!name) {
        hasAnyError = true
        errorResponse.errors.push('Role must has name.')
    } else if (typeof name !== 'string') {
        hasAnyError = true
        errorResponse.errors.push('Role name must be a string.')
    } else if (name.length < 3) {
        hasAnyError = true
        errorResponse.errors.push('Role name must be at least 3 symbols length.')
    } else {
        const exist = await Role.findOne({ name, }).catch(() => {
            errorResponse.errors.push(`Can not test role name for uniqueness.`)
        })
        if (exist) {
            hasAnyError = true
            errorResponse.errors.push(`Role name "${name}" taken already.`)
            errStatus = 409
        }
    }

    return [ errorResponse, hasAnyError, errStatus, ]
}
