/* eslint-disable no-param-reassign */
import HTTPStatus from 'http-status'

import User from './user.model'
// import Role from '../roles/role.model'
export async function signUp (ctx, next) {
    try {
        ctx.status = HTTPStatus.CREATED
        const newUser = await User.create(ctx.request.body).catch(() => ctx.throw(409, 'Duplicate key detected during user creation.'))
        ctx.body = { user: newUser.toAuthJSON(), }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function login (ctx, next) {
    try {
        ctx.status = HTTPStatus.OK
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getUsersList (ctx, next) {
    try {
        ctx.status = HTTPStatus.OK
        const limit = ctx.request.query.limit ? parseInt(ctx.request.query.limit, 10) : 0
        const skip = ctx.request.query.skip ? parseInt(ctx.request.query.skip, 10) : 0
        const users = await User.list({ limit, skip, })
        ctx.body = { users, }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

export async function getUserById (ctx, next) {
    try {
        const user = await User.findById(ctx.params.id)
        // .populate({ path: 'roles', populate: { path: 'permissions', }, })
        // .catch(
        //     () => new Error(`Can not find User with id === ${req.params.id}.`),
        // )
        ctx.body = { user: user.toAdminJSON(), }
        return next()
    } catch (err) {
        ctx.status = err.status || HTTPStatus.BAD_REQUEST
        ctx.body = { message: err.message, }
        return next()
    }
}

/**
 * Обновляет Юзера. Кроме Ролей.
 */
// export async function updateUser (req, res) {
//     try {
//         const user = req._user
//             ? req._user
//             : await User.findById(req.params.id)
//                 .populate({ path: 'roles', populate: { path: 'permissions', }, })
//                 .catch(
//                     () => new Error(`Can not find User with id === ${req.params.id}.`),
//                 )
//         Object.keys(req.body).forEach(key => {
//             user[key] = req.body[key]
//         })
//         return res.status(HTTPStatus.OK).json(await user.save())
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }

/**
 * Превращает массив Ролей req.body.roles в массив ObjectId
 *
 * На входе массив типа [ "admin", "reader" ]
 *
 * На выходе:
 * [ 5c2defea714ac746aa1c80c0', '5c2defea714ac746aa1c80bf', ]
 *
 * Ненайденные Роли пропускает.
 *
 * @returns {Promise<*>}
 */
// export async function transformRolesSkipInvalid (req, res, next) {
//     try {
//         const roles = [ ...req.body.roles, ]
//         if (roles.length === 0) {
//             return next()
//         }
//         const foundRoles = await Role.findRolesByNames(roles)
//         for (let i = 0; i < foundRoles.length; i++) {
//             if (foundRoles[i] === null) {
//                 foundRoles.splice(i, 1)
//                 i--
//             }
//         }
//         req.body.roles = foundRoles.map(item => item._id)
//         return next()
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }
//
// export async function updateUserRoles (req, res) {
//     try {
//         const role = await User.updateRoles(req.params.id, req.body.roles)
//         return res.status(HTTPStatus.OK).json(role.toJSON())
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }
//
// export async function removeRolesFromUser (req, res) {
//     try {
//         const role = await User.deleteRoles(req.params.id, req.body.roles)
//         return res.status(HTTPStatus.OK).json(role.toJSON())
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }

// export async function deleteUser (req, res) {
//     try {
//         const user = req._user
//             ? req._user
//             : await User.findById(req.params.id)
//                 .populate({ path: 'roles', populate: { path: 'permissions', }, })
//                 .catch(
//                     () => new Error(`Can not find User with id === ${req.params.id}.`),
//                 )
//         const name = user.userName
//         await user.remove()
//         return res.status(HTTPStatus.OK).json({
//             message: `User ${name} successfully deleted.`,
//             status: 'OK',
//         })
//     } catch (err) {
//         return res.status(HTTPStatus.BAD_REQUEST).json(err)
//     }
// }
