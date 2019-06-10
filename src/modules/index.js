import userRouter from './users/user.routes'
// import roomRoutes from './rooms/room.router'
// import permissionRoutes from './permissions/permission.router'
// import roleRoutes from './roles/role.router'

export default app => {
    app.use(userRouter.routes())
    app.use(userRouter.allowedMethods())
    // app.use('/api/v1/rooms', roomRoutes)
    // app.use('/api/v1/permissions', permissionRoutes)
    // app.use('/api/v1/roles', roleRoutes)
}
