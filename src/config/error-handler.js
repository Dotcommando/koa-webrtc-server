export default async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        // will respond with JSON only
        ctx.status = err.statusCode || err.status || 500
        ctx.body = {
            success: false,
            message: err.message,
        }
    }
}
