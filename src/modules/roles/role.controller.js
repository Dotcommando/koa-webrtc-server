/* eslint-disable no-param-reassign */
import HTTPStatus from 'http-status'

import Role from './role.model'
import Permission from '../permissions/permission.model'

export async function createRole (ctx, next) {
    try {
        const role = await Role.createRole({
            ...ctx.request.body,
            permissions: ctx.processedPermissions ? ctx.processedPermissions : [],
        }).catch(() => ctx.throw(409, 'Duplicate key detected during role creation.'))
        ctx.status = HTTPStatus.CREATED
        ctx.body = { role, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getRoleById (ctx, next) {
    try {
        const role = await Role.findById(ctx.params.id)
            .populate('permissions')
            .catch(
                () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not find Role with id === ${req.params.id}.`),
            )
        ctx.status = HTTPStatus.OK
        ctx.body = { role, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getRolesList (ctx, next) {
    try {
        const limit = ctx.request.query.limit ? parseInt(ctx.request.query.limit, 10) : 0
        const skip = ctx.request.query.skip ? parseInt(ctx.request.query.skip, 10) : 0
        const roles = await Role.list({ limit, skip, })
        ctx.status = HTTPStatus.OK
        ctx.body = { roles, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function renameRole (ctx, next) {
    try {
        const role = await Role.findById(ctx.request.params.id)
            .populate('permissions')
            .catch(
                () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not find role with id === ${ctx.request.params.id}.`),
            )
        role.name = ctx.request.body.name
        await role.save()
        ctx.status = HTTPStatus.OK
        ctx.body = { role, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function deleteRole (ctx, next) {
    try {
        const role = await Role.findById(ctx.request.params.id)
            .populate('permissions')
            .catch(
                () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not find role with id === ${ctx.request.params.id}.`),
            )
        const name = role.name
        await role.remove()
        ctx.status = HTTPStatus.OK
        ctx.body = { message: `Role ${name} successfully deleted.`, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

/**
 * Превращает массив разрешений в массив пар типа
 *
 * [
 *   [ "action1", "subject1" ],
 *   [ "action2", "subject2" ],
 * ]
 *
 * Ненайденные разрешения создаёт.
 *
 * @returns {Promise<*>}
 */
export async function transformPermissions (ctx, next) {
    try {
        const permissions = [ ...ctx.request.body.permissions, ]
        if (permissions.length === 0) {
            ctx.processedPermissions = null
            return next()
        }
        ctx.processedPermissions = await Permission.processArrayOfPermissions(
            permissions,
            'createNew',
        )
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

/**
 * Превращает массив разрешений req.body.permissions в массив пар типа
 *
 * [
 *   [ "action1", "subject1" ],
 *   [ "action2", "subject2" ],
 * ]
 *
 * Ненайденные разрешения пропускает.
 *
 * @returns {Promise<*>}
 */
export async function transformPermissionsSkipInvalid (ctx, next) {
    try {
        const permissions = [ ...ctx.request.body.permissions, ]
        if (permissions.length === 0) {
            ctx.processedPermissions = null
            return next()
        }
        ctx.processedPermissions = await Permission.processArrayOfPermissions(
            permissions,
            'skip',
        )
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

/**
 * Добавляет разрешения в Роль.
 */
export async function addPermissions (req, res) {
    try {
        const role = await Role.updatePermissions(
            req.params.id,
            req.body.permissions,
        ).catch(() => new Error(`Can not update role with id "${req.params.id}".`))
        if (!role) {
            return res.status(HTTPStatus.NOT_FOUND).json({
                message: `Role with ID '${req.params.id}' not found.`,
                status: 'Failed',
            })
        }
        return res.status(HTTPStatus.CREATED).json(role)
    } catch (err) {
        return res.status(HTTPStatus.BAD_REQUEST).json(err)
    }
}

/**
 * Удаляет разрешения из Роли.
 */
export async function removePermissions (req, res) {
    try {
        const role = await Role.deletePermissions(
            req.params.id,
            req.body.permissions,
        ).catch(() => new Error(`Can not update role with id "${req.params.id}".`))
        if (!role) {
            return res.status(HTTPStatus.NOT_FOUND).json({
                message: `Role with ID '${req.params.id}' not found.`,
                status: 'Failed',
            })
        }
        return res.status(HTTPStatus.CREATED).json(role)
    } catch (err) {
        return res.status(HTTPStatus.BAD_REQUEST).json(err)
    }
}
