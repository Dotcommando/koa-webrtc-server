import mongoose, { Schema, } from 'mongoose'

import { asyncForEach, } from '../../helpers/async-foreach'
import Role from '../roles/role.model'

const PermissionSchema = new Schema({
    action: {
        type: String,
        required: [ true, 'Action is required.', ],
        minLength: [ 3, 'Action must be longer.', ],
        trim: true,
        lowercase: true,
    },
    subject: {
        type: String,
        required: [ true, 'Subject is required.', ],
        minLength: [ 3, 'Subject must be longer.', ],
        trim: true,
        lowercase: true,
    },
})

PermissionSchema.methods = {
    toJSON () {
        return {
            id: this._id,
            action: this.action,
            subject: this.subject,
        }
    },
}

PermissionSchema.statics = {
    /**
   * Ищет разрешение по action и subject.
   * Вернёт найденное право полностью.
   * @param action
   * @param subject
   * @returns {Query|void}
   */
    findByActionAndSubject ({ action, subject, } = {}) {
        let searchParams = {}
        if (action) {
            searchParams = { ...searchParams, action, }
        }
        if (subject) {
            searchParams = { ...searchParams, subject, }
        }
        return this.findOne(searchParams)
    },

    list ({ limit, skip, } = {}) {
        return this.find()
            .skip(skip)
            .limit(limit)
    },

    /**
   * Получает массив массивов в формате:
   * [
   *  ['action1', 'subject1'],
   *  ['action2', 'subject2'],
   *  ['action3', 'subject3'],
   *  ...
   * ]
   * После чего пробегает по нему и возвращает массив
   * из разрешений, где разрешения представлены ПОЛНОСТЬЮ.
   *
   * @param permissions - собственно массив.
   * @param ifNull - стратегия, если разрешение не найдено в БД.
   *   'fallDown' - по умолчанию. Падает с ошибкой.
   *   'createNew' - создаёт новое разрешение и кладёт его ObjectId в массив.
   *   'skip' - пропускает несуществующее разрешение. Нужно для удаления.
   * @returns {Promise<Array>}
   */
    async processArrayOfPermissions (permissions, ifNull = 'fallDown') {
        const totalPermissions = []
        await asyncForEach(permissions, async perm => {
            let targetPermission = await this.findByActionAndSubject({
                action: perm[0],
                subject: perm[1],
            })
            if (!targetPermission && ifNull === 'fallDown') {
                throw new Error('Permission not found.')
            } else if (!targetPermission && ifNull === 'createNew') {
                targetPermission = await this.createPermission({
                    action: perm[0],
                    subject: perm[1],
                }).catch(() => new Error('Can not create new Permission.'))
            }
            totalPermissions.push(targetPermission)
        })
        return totalPermissions
    },
}

/**
 * Хук PRE для REMOVE.
 * При удалении Разрешения, ищет его вхождения в Ролях
 * и удаляет оттуда.
 */
PermissionSchema.pre('remove', async function (next) {
    const roles = await Role.find({
        permissions: {
            $elemMatch: {
                $eq: this._id,
            },
        },
    })
    if (!roles) {
        return next()
    }
    const ids = roles.map(item => item._id)
    await Role.updateMany(
        {
            _id: { $in: ids, },
        },
        {
            $pullAll: {
                permissions: [ this._id, ],
            },
        },
    )
    return next()
})

export default mongoose.model('Permission', PermissionSchema)
