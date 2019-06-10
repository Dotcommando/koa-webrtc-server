import Router from 'koa-router'

import { authLocal, authJwt, } from '../../services/auth.service'
import * as userController from './user.controller'
// import * as userValidation from './user.validation'
// import * as AccessControl from '../../services/access-control.service'

const basePath = '/api/v1/users'
const router = new Router()

/**
 * Регистрация Юзера.
 *
 * @req.body.email - string, email, required, unique.
 * @req.body.userName - string, unique, required.
 * @req.body.firstName - string, required.
 * @req.body.lastName - string, required.
 * @req.body.password - string, required, not less one of: number, lowercase, uppercase.
 */
router.post(
    basePath + '/signup',
    // userValidation.signUp,
    userController.signUp
)

/**
 * Логин Юзера.
 *
 * @req.body.email - email or Username, string, required.
 * @req.body.password - string, required.
 */
// router.post(
//     basePath + '/login',
//     // userValidation.login,
//     authLocal,
//     userController.login
// )

/**
 * Получить список Юзеров.
 *
 * @req.query.skip - integer, positive or zero.
 * @req.query.limit - integer, positive or zero.
 */
// router.get(
//     basePath + '/',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', 'readonly', ]),
//     userValidation.getUsersList,
//     userController.getUsersList,
// )

/**
 * Получить Юзера по Id.
 *
 * @req.params.id - MongoId, required.
 */
// router.get(
//     basePath + '/:id/',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', 'readonly', ]),
//     userValidation.checkUserID('Request for get User by Id is invalid.'),
//     userController.getUserById,
// )

/**
 * Обновить Юзера, кроме Ролей.
 *
 * @req.body.email - string, email, optional, unique.
 * @req.body.userName - string, unique, optional.
 * @req.body.firstName - string, optional.
 * @req.body.lastName - string, optional.
 * @req.body.password - string, optional, not less one of: number, lowercase, uppercase.
 */
// router.patch(
//     basePath + '/:id/',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', ]),
//     userValidation.checkUserID('Request for update User is invalid.'),
//     userValidation.updateUser,
//     userController.updateUser,
// )

/**
 * Добавить Юзеру Роли.
 *
 * @req.body.roles - array of roles.
 */
// router.patch(
//     basePath + '/:id/add-roles',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', ]),
//     userValidation.checkRoles,
//     userController.transformRolesSkipInvalid,
//     userController.updateUserRoles,
// )

/**
 * Удалить Роли у Юзера.
 *
 * @req.body.roles - array of roles.
 */
// router.patch(
//     basePath + '/:id/remove-roles',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', ]),
//     userValidation.checkRoles,
//     userController.transformRolesSkipInvalid,
//     userController.removeRolesFromUser,
// )

/**
 * Удалить Юзера по Id.
 *
 * @req.params.id - MongoId, required.
 */
// router.delete(
//     basePath + '/:id/',
//     authJwt,
//     AccessControl.HasAnyRole([ 'superadmin', 'admin', ]),
//     userValidation.checkUserID('Request for delete User is invalid.'),
//     userController.deleteUser,
// )

export default router
