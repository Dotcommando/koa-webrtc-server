import mongoose, { Schema, } from 'mongoose'
import validator from 'validator'
import { hashSync, compareSync, } from 'bcrypt-nodejs'
import jwt from 'jsonwebtoken'
import uniqueValidator from 'mongoose-unique-validator'

import { passwordReg, } from './user.validation'
import constants from '../../config/constants'
// import Room from '../rooms/room.model'

const UserSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            required: [ true, 'E-mail is required.', ],
            trim: true,
            validate: {
                validator (email) {
                    return validator.isEmail(email)
                },
                message: '{VALUE} is not a valid email.',
            },
        },
        lastName: {
            type: String,
            required: [ true, 'Last name is required.', ],
            trim: true,
        },
        firstName: {
            type: String,
            required: [ true, 'First name is required.', ],
            trim: true,
        },
        userName: {
            type: String,
            required: [ true, 'User name is required.', ],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [ true, 'Password is required.', ],
            minLength: [ 6, 'Passwords needs to be longer!', ],
            validate: {
                validator (password) {
                    return passwordReg.test(password)
                },
                message: '{VALUE} is not a valid password.',
            },
        },
        roles: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Role',
            },
        ],
    },
    { timestamps: true, },
)

UserSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = this._hashPassword(this.password)
        return next()
    }

    return next()
})

UserSchema.methods = {
    _hashPassword (password) {
        return hashSync(password)
    },
    authenticateUser (password) {
        return compareSync(password, this.password)
    },
    createToken () {
        return jwt.sign(
            {
                _id: this._id, // this === user
            },
            constants.JWT_SECRET,
        )
    },
    toAdminJSON () {
        return {
            id: this._id,
            userName: this.userName,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
        }
    },
    toAuthJSON () {
        return {
            userName: this.userName,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles.map(item => {
                return {
                    name: item.name,
                    permissions: item.permissions.map(perm => [
                        perm.action,
                        perm.subject,
                    ]),
                }
            }),
            token: `JWT ${this.createToken()}`,
        }
    },
    toJSON () {
        return {
            id: this._id,
            userName: this.userName,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles,
            token: `JWT ${this.createToken()}`,
        }
    },
}

UserSchema.statics = {
    list ({ limit, skip, } = {}) {
        return this.find()
            .populate({ path: 'roles', populate: { path: 'permissions', }, })
            .skip(skip)
            .limit(limit)
    },

    /**
   * Добавляет Роли в массив Ролей Юзера.
   * @param userId
   * @param roles - массив ObjectId Ролей.
   * @returns {Promise<void>}
   */
    async updateRoles (userId, roles) {
        return await this.findOneAndUpdate(
            { _id: userId, },
            {
                $addToSet: {
                    roles: {
                        $each: roles,
                    },
                },
            },
            { new: true, },
        ).populate({ path: 'roles', populate: { path: 'permissions', }, })
    },

    /**
   * Удаляет Роли из массива Ролей Юзера.
   * @param userId
   * @param roles - массив ObjectId Ролей.
   * @returns {Promise<void>}
   */
    async deleteRoles (userId, roles) {
        return await this.findOneAndUpdate(
            { _id: userId, },
            {
                $pullAll: {
                    roles,
                },
            },
            { new: true, },
        ).populate({ path: 'roles', populate: { path: 'permissions', }, })
    },
}

/**
 * Хук PRE для REMOVE.
 * При удалении Юзера, ищет таски, созданные им
 * и очищает таскам поле user.
 */
UserSchema.pre('remove', async function (next) {
    const rooms = await Room.find({
        user: this._id,
    })
    if (!rooms) {
        return next()
    }
    const ids = rooms.map(item => item._id)
    await Room.updateMany(
        {
            _id: { $in: ids, },
        },
        {
            user: null,
        },
    )
    return next()
})

UserSchema.plugin(uniqueValidator, {
    message: '{VALUE} is already taken.',
})

export default mongoose.model('User', UserSchema)
