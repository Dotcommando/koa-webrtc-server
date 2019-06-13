import mongoose, { Schema, } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

import User from '../users/user.model'

const RoleSchema = new Schema({
    name: {
        type: String,
        required: [ true, 'Role name is required.', ],
        trim: true,
        unique: true,
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Permission',
        },
    ],
})

RoleSchema.methods = {
    toJSON () {
        return {
            id: this._id,
            name: this.name,
            permissions: this.permissions.map(item => [ item.action, item.subject, ]),
        }
    },
}

RoleSchema.statics = {
    async createRole (args) {
        return await this.create(args)
    },
    async findRolesByPermission (permissionId) {
        return await this.find({ permissions: permissionId, }).populate(
            'permissions',
        )
    },

    /**
   * Добавляет разрешения в массив разрешений Роли.
   * @param roleId
   * @param permissions - массив Разрешений в полном виде.
   * @returns {Promise<void>}
   */
    async updatePermissions (roleId, permissions) {
        const permissionsIDs = permissions.map(item => item._id)
        return await this.findOneAndUpdate(
            { _id: roleId, },
            {
                $addToSet: {
                    permissions: {
                        $each: permissionsIDs,
                    },
                },
            },
            { new: true, },
        ).populate('permissions')
    },
    async deletePermissions (roleId, permissions) {
        return await this.findOneAndUpdate(
            { _id: roleId, },
            {
                $pullAll: {
                    permissions,
                },
            },
            { new: true, },
        ).populate('permissions')
    },
    list ({ limit, skip, } = {}) {
        return this.find()
            .populate('permissions')
            .skip(skip)
            .limit(limit)
    },
    /**
   * Ищет Роли по их именам.
   * Принимает массив имён ролей.
   */
    async findRolesByNames (roles) {
        return await this.find({ name: { $in: roles, }, })
    },
}

/**
 * Хук PRE для REMOVE.
 * При удалении Роли, ищет её вхождения в Юзерах
 * и удаляет оттуда.
 */
RoleSchema.pre('remove', async function (next) {
    const roles = await User.find({
        roles: {
            $elemMatch: {
                $eq: this._id,
            },
        },
    })
    if (!roles) {
        return next()
    }
    const ids = roles.map(item => item._id)
    await User.updateMany(
        {
            _id: { $in: ids, },
        },
        {
            $pullAll: {
                roles: [ this._id, ],
            },
        },
    )
    return next()
})

RoleSchema.plugin(uniqueValidator, {
    message: '{VALUE} is already exists.',
})

export default mongoose.model('Role', RoleSchema)
