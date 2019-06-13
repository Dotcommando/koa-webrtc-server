/* eslint-disable no-param-reassign */
import HTTPStatus from 'http-status'

import Permission from './permission.model'
import Role from '../roles/role.model'
import { asyncForEach, } from '../../helpers/async-foreach'

export async function createPermission (ctx, next) {
    try {
        // Если создаём одно разрешение.
        if (ctx.request.body.permission) {
            const exist = await Permission.findByActionAndSubject(
                ctx.request.body.permission,
            ).catch(() => ctx.throw(HTTPStatus.BAD_REQUEST, 'Can not check if permission exists already.'))
            if (exist) {
                ctx.status = HTTPStatus.CREATED
                ctx.body = { permission: exist, }
                return next()
            }
            const newPermission = await Permission.create(ctx.request.body.permission).catch(
                () => ctx.throw(HTTPStatus.BAD_REQUEST, 'Can not create new permission.'),
            )
            ctx.status = HTTPStatus.CREATED
            ctx.body = { permission: newPermission, }
            return next()
        }
        // Если мы оказались тут, значит создаём Разрешения пакетно.
        const result = []
        const perms = ctx.request.body.permissions
        if (perms.length === 0) {
            ctx.status = HTTPStatus.CREATED
            ctx.body = { permissions: [], }
            return next()
        }
        await asyncForEach(perms, async item => {
            const exist = await Permission.findByActionAndSubject(item).catch(
                () => ctx.throw(HTTPStatus.BAD_REQUEST, 'Can not check if permission exists already.'),
            )
            if (exist) {
                result.push(exist)
            } else {
                const newPermission = await Permission.create(item).catch(
                    () => ctx.throw(HTTPStatus.BAD_REQUEST, 'Can not create new permission.'),
                )
                result.push(newPermission)
            }
        })
        ctx.status = HTTPStatus.CREATED
        ctx.body = { permissions: result, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function updatePermission (ctx, next) {
    try {
        const targetPermission = await Permission.findById(ctx.params.id).catch(
            () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not find permission with id === ${ctx.params.id}.`),
        )
        const resultSupposedPermission = {
            action: targetPermission.action,
            subject: targetPermission.subject,
            ...ctx.request.body,
        }
        const duplicate = await Permission.findByActionAndSubject(resultSupposedPermission)
        if (duplicate) {
            ctx.status = HTTPStatus.CONFLICT
            ctx.body = { permission: duplicate.toJSON(), }
            return next()
        }
        targetPermission.action = resultSupposedPermission.action
        targetPermission.subject = resultSupposedPermission.subject
        const result = await targetPermission.save()
        ctx.status = HTTPStatus.OK
        ctx.body = { permission: result.toJSON(), }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getPermissionById (ctx, next) {
    try {
        const permission = await Permission.findById(ctx.params.id).catch(
            () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not find permission with id === ${ctx.params.id}.`),
        )
        ctx.status = HTTPStatus.OK
        ctx.body = { permission: permission.toJSON(), }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getPermissionsList (ctx, next) {
    try {
        const limit = ctx.request.query.limit ? parseInt(ctx.request.query.limit, 10) : 0
        const skip = ctx.request.query.skip ? parseInt(ctx.request.query.skip, 10) : 0
        const permissions = await Permission.list({ limit, skip, })
        ctx.status = HTTPStatus.OK
        ctx.body = { permissions, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

// export async function getRolesByPermission (req, res) {
//     try {
//         const permission = await Permission.findByActionAndSubject({
//             action: req.body.action,
//             subject: req.body.subject,
//         }).catch(
//             () => new Error(`Can not find Permission by its action and subject.`),
//         )
//         if (!permission) {
//             return res.status(HTTPStatus.NOT_FOUND).json({
//                 message: `Permission [ '${req.body.action}', '${
//                     req.body.subject
//                 }' ] not found.`,
//                 status: 'Failed',
//             })
//         }
//         let roles
//         if (permission) {
//             roles = await Role.findRolesByPermission(permission._id).catch(
//                 () => new Error(`Can not find Roles by Permission.`),
//             )
//         } else {
//             roles = []
//         }
//         return res.status(HTTPStatus.OK).json(roles)
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }

export async function deletePermission (ctx, next) {
    try {
        const permission = await Permission.findOne({
            action: ctx.request.body.action,
            subject: ctx.request.body.subject,
        }).catch(
            () => ctx.throw(HTTPStatus.NOT_FOUND, `Can not get Permission by its action and subject.`),
        )
        if (!permission) {
            ctx.throw(HTTPStatus.NOT_FOUND, `Permission [ '${ctx.request.body.action}', '${ctx.request.body.subject}' ] not found.`)
        }
        await permission.remove()
        ctx.status = HTTPStatus.OK
        ctx.body = { message: `Permission [ '${ctx.request.body.action}', '${ctx.request.body.subject}' ] successfully deleted.`, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}
