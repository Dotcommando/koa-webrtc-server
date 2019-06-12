export default app => {
    app.use(async (ctx, next) => {
        ctx.body.success = ctx.status === 200 || ctx.status === 201 || ctx.status === 206
        return next()
    })
}

