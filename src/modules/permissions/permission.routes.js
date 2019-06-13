import Router from 'koa-router'

import { authJwt, } from '../../services/auth.service'
import * as permissionController from './permission.controller'
// import * as permissionValidation from './permission.validation'
// import * as AccessControl from '../../services/access-control.service'

const basePath = '/api/v1/permissions'
const router = new Router()

/**
 * Создаёт Разрешение.
 *
 * @req.body.permission - object, required.
 * @req.body.permission.action - string, required, min = 3.
 * @req.body.permission.subject - string, required, min = 3.
 *
 * !!!OR!!!
 *
 * @req.body.permissions - array of objects
 *      action - string, required, min = 3.
 *      subject - string, required, min = 3.
 */
router.post(
    basePath + '/',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // permissionValidation.createPermission,
    permissionController.createPermission,
)

/**
 * Обновляет Разрешение.
 *
 * @req.body.action - string, min = 3.
 *
 * !!!OR/AND!!!
 *
 * @req.body.subject - string, min = 3.
 */
router.patch(
    basePath + '/:id',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // permissionValidation.updatePermission,
    permissionController.updatePermission,
)

// /**
//  * Ищет Роли по параметрам action и subject.
//  *
//  * @req.body.action - string, required, min = 3.
//  * @req.body.subject - string, required, min = 3.
//  */
// router.get(
//     basePath + '/roles-by-permission',
//     authJwt,
//     // AccessControl.HasAnyRole([ 'superadmin', 'admin', 'readonly', ]),
//     // permissionValidation.getRolesByPermission,
//     permissionController.getRolesByPermission,
// )

/**
 * Отдаёт Разрешение по его ID.
 *
 * @req.params.id - MongoId, required.
 */
router.get(
    basePath + '/:id',
    authJwt,
    // AccessControl.HasAnyRole([ 'superadmin', 'readonly', ]),
    // permissionValidation.getPermissionById,
    permissionController.getPermissionById,
)

/**
 * Отдаёт список разрешений.
 *
 * @req.query.skip - integer, positive or zero.
 * @req.query.limit - integer, positive or zero.
 */
router.get(
    basePath + '/',
    authJwt,
    // AccessControl.HasAnyRole([ 'superadmin', 'readonly', ]),
    // permissionValidation.getPermissionsList,
    permissionController.getPermissionsList,
)

/**
 * Удаляет разрешение.
 *
 * @req.body.action - string, required, min = 3.
 * @req.body.subject - string, required, min = 3.
 */
router.delete(
    basePath + '/delete-permission',
    authJwt,
    // AccessControl.HasRole('superadmin'),
    // permissionValidation.deletePermission,
    permissionController.deletePermission,
)

export default router
