import userRouter from './users/user.routes'
// import roomRoutes from './rooms/room.router'
import permissionRoutes from './permissions/permission.routes'
import roleRoutes from './roles/role.routes'

export default app => {
    app.use(userRouter.routes())
    app.use(userRouter.allowedMethods())
    // app.use('/api/v1/rooms', roomRoutes)
    app.use(permissionRoutes.routes())
    app.use(permissionRoutes.allowedMethods())
    app.use(roleRoutes.routes())
    app.use(roleRoutes.allowedMethods())
    // app.use('/api/v1/roles', roleRoutes)
}
