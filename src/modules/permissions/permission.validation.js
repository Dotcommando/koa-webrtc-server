/* eslint-disable no-param-reassign */
import _ from 'lodash'

import Permission from './permission.model'

export async function createPermission (req, res, next) {
    const errorResponse = {
        message: 'Request for permission create is invalid.',
        status: 'Failed',
        errors: [],
    }

    if (!req.body.permission && !req.body.permissions) {
        errorResponse.errors.push(
            'Request must has one of parameters: "permission", or "permissions".',
        )
        res.statusCode = 400
        return res.json(errorResponse)
    }

    if (req.body.permission) {
        req
            .checkBody('permission', 'Parameter "permission" must be an object.')
            .custom(value => _.isPlainObject(value))
        req
            .checkBody(
                'permission.action',
                'Permission action must be at least 3 symbols length.',
            )
            .optional()
            .isByteLength({ min: 3, })
        req
            .checkBody('permission.action', 'Permission action required.')
            .notEmpty()
        req
            .checkBody(
                'permission.subject',
                'Permission subject must be at least 3 symbols length.',
            )
            .optional()
            .isByteLength({ min: 3, })
        req
            .checkBody('permission.subject', 'Permission subject required.')
            .notEmpty()
    } else if (req.body.permissions) {
        req
            .checkBody(
                'permissions',
                'Parameter "permissions" must be an array of objects.',
            )
            .custom(value => _.isArray(value) && value.length > 0)
        req
            .checkBody(
                'permissions.*.action',
                'Permission action must be at least 3 symbols length.',
            )
            .optional()
            .isByteLength({ min: 3, })
        req
            .checkBody('permissions.*.action', 'Permission action required.')
            .notEmpty()
        req
            .checkBody(
                'permissions.*.subject',
                'Permission subject must be at least 3 symbols length.',
            )
            .optional()
            .isByteLength({ min: 3, })
        req
            .checkBody('permissions.*.subject', 'Permission subject required.')
            .notEmpty()
    }

    const errors = req.validationErrors()
    if (errors) {
        errors.forEach(item => {
            if (!errorResponse.errors.includes(item.msg))
                errorResponse.errors.push(item.msg)
        })
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

export async function updatePermission (req, res, next) {
    const errorResponse = {
        message: 'Request for permission update is invalid.',
        status: 'Failed',
        errors: [],
    }

    const permission = await Permission.findById(req.params.id).catch(() => {
        errorResponse.errors.push(`Permission id ${req.params.id} is invalid.`)
    })
    if (!permission) {
        res.statusCode = 404
        errorResponse.errors.push(`Permission with id ${req.params.id} not found.`)
        return res.json(errorResponse)
    }

    req._permission = permission

    if (!req.body.action && !req.body.subject) {
        res.statusCode = 400
        errorResponse.errors.push(
            `For update permission you should send one or both of parameters: action or/and subject.`,
        )
        return res.json(errorResponse)
    }

    if (req.body.action)
        req
            .checkBody('action', 'Action is less than 3 symbols.')
            .isByteLength({ min: 3, })
    if (req.body.subject)
        req
            .checkBody('subject', 'Subject is less than 3 symbols.')
            .isByteLength({ min: 3, })

    const errors = req.validationErrors()
    if (errors) {
        errors.forEach(item => {
            if (!errorResponse.errors.includes(item.msg))
                errorResponse.errors.push(item.msg)
        })
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

export async function getRolesByPermission (req, res, next) {
    const errorResponse = {
        message: 'Request for search Roles by permission is invalid.',
        status: 'Failed',
        errors: [],
    }

    if (!req.body.action || !req.body.subject) {
        res.statusCode = 400
        errorResponse.errors.push(
            `Request for search Roles by permission must contains both of parameters: action and subject.`,
        )
        return res.json(errorResponse)
    }

    req
        .checkBody('action', 'Action is less than 3 symbols.')
        .optional()
        .isByteLength({ min: 3, })
    req
        .checkBody('action', 'Action must be a string.')
        .optional()
        .isAlphanumeric()
    req
        .checkBody('subject', 'Subject is less than 3 symbols.')
        .optional()
        .isByteLength({ min: 3, })
    req
        .checkBody('subject', 'Subject must be a string')
        .optional()
        .isAlphanumeric()

    const errors = req.validationErrors()
    if (errors) {
        errors.forEach(item => {
            if (!errorResponse.errors.includes(item.msg))
                errorResponse.errors.push(item.msg)
        })
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

export async function getPermissionById (req, res, next) {
    const errorResponse = {
        message: 'Request for get permission by Id is invalid.',
        status: 'Failed',
        errors: [],
    }

    const permission = await Permission.findById(req.params.id).catch(() => {
        errorResponse.errors.push(`Permission id ${req.params.id} is invalid.`)
    })
    if (!permission) {
        res.statusCode = 404
        errorResponse.errors.push(`Permission with id ${req.params.id} not found.`)
        return res.json(errorResponse)
    }

    req._permission = permission

    return next()
}

export async function deletePermission (req, res, next) {
    const errorResponse = {
        message:
      'Request for delete permission by its action and subject is invalid.',
        status: 'Failed',
        errors: [],
    }

    if (!req.body.action || !req.body.subject) {
        res.statusCode = 400
        errorResponse.errors.push(
            `Request for delete permission must contains both of parameters: action and subject.`,
        )
        return res.json(errorResponse)
    }

    req
        .checkBody('action', 'Action is less than 3 symbols.')
        .optional()
        .isByteLength({ min: 3, })
    req
        .checkBody('action', 'Action must be a string.')
        .optional()
        .isAlphanumeric()
    req
        .checkBody('subject', 'Subject is less than 3 symbols.')
        .optional()
        .isByteLength({ min: 3, })
    req
        .checkBody('subject', 'Subject must be a string')
        .optional()
        .isAlphanumeric()

    const errors = req.validationErrors()
    if (errors) {
        errors.forEach(item => {
            if (!errorResponse.errors.includes(item.msg))
                errorResponse.errors.push(item.msg)
        })
        res.statusCode = 400
        return res.json(errorResponse)
    }

    return next()
}

export async function getPermissionsList (req, res, next) {
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
