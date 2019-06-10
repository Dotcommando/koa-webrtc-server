const devConfig = {
    MONGO_URL: 'mongodb://localhost/koa-webrtc-server',
    JWT_SECRET: 'PaI4JO8yfgQkw2o0893wM1w34230efLh',
}

const testConfig = {
    MONGO_URL: 'mongodb://localhost/koa-webrtc-server',
}

const prodConfig = {
    MONGO_URL: 'mongodb://localhost/koa-webrtc-server-prod',
}

const defaultConfig = {
    PORT: process.env.PORT || 3001,
}

function envConfig (env) {
    switch (env) {
    case 'development':
        return devConfig
    case 'test':
        return testConfig
    default:
        return prodConfig
    }
}

export default {
    ...defaultConfig,
    ...envConfig(process.env.NODE_ENV),
}
