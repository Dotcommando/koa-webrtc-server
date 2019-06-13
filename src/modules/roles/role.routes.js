import Router from 'koa-router'

import { authJwt, } from '../../services/auth.service'
import * as roleController from './role.controller'
// import * as roleValidation from './role.validation'
// import * as AccessControl from '../../services/access-control.service'

const basePath = '/api/v1/roles'
const routes = new Router()

/**
 * Создать Роль.
 *
 * @req.body.name - string, required, unique, min = 3.
 * @req.body.permissions - required, array of arrays:
 *     [0] - (action) string, required, min = 3.
 *     [1] - (subject) string, required, min = 3.
 */
routes.post(
    basePath + '/',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // roleValidation.validatePermissions,
    roleController.transformPermissions,
    // roleValidation.createRole,
    roleController.createRole,
)

/**
 * Получить Роль по Id.
 *
 * @req.params.id - MongoId, required.
 */
routes.get(
    basePath + '/:id/',
    authJwt,
    // AccessControl.HasAnyRole([ 'superadmin', 'admin', 'readonly', ]),
    // roleValidation.checkRoleID('Request for get role by Id is invalid.'),
    roleController.getRoleById,
)

/**
 * Отдаёт список Ролей.
 *
 * @req.query.skip - integer, positive or zero.
 * @req.query.limit - integer, positive or zero.
 */
routes.get(
    basePath + '/',
    authJwt,
    // AccessControl.HasAnyRole([ 'superadmin', 'admin', 'readonly', ]),
    // roleValidation.getRolesList,
    roleController.getRolesList,
)

/**
 * Добавить пакетно разрешения в Роль.
 *
 * @req.params.id - MongoId, required.
 *
 * @req.body.permissions - required, array of arrays:
 *     [0] - (action) string, required, min = 3.
 *     [1] - (subject) string, required, min = 3.
 */
routes.patch(
    basePath + '/:id/add-permissions',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // roleValidation.validatePermissions,
    roleController.transformPermissions,
    // roleValidation.checkRoleID('Request for add permissions to role is invalid.'),
    roleController.addPermissions,
)

/**
 * Удалить пакетно разрешения из Роли.
 *
 * @req.params.id - MongoId, required.
 *
 * @req.body.permissions - required, array of arrays:
 *     [0] - (action) string, required, min = 3.
 *     [1] - (subject) string, required, min = 3.
 */
routes.patch(
    basePath + '/:id/remove-permissions',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // roleValidation.validatePermissions,
    roleController.transformPermissionsSkipInvalid,
    // roleValidation.checkRoleID(
    //     'Request for remove permissions from role is invalid.',
    // ),
    roleController.removePermissions,
)

/**
 * Переименовать Роль.
 *
 * @req.params.id - MongoId, required.
 *
 * @req.body.name - string, required, unique, min = 3.
 */
routes.patch(
    basePath + '/:id/rename',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // roleValidation.renameRole,
    roleController.renameRole,
)

/**
 * Удалить роль.
 *
 * @req.params.id - MongoId, required.
 */
routes.delete(
    basePath + '/:id',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // roleValidation.checkRoleID('Request for role delete is invalid.'),
    roleController.deleteRole,
)

export default routes
