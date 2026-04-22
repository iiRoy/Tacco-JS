const webFramework = require('express');
const dataSyncEngine = require('derby');
const clientCommsChannel = require('racer-browserchannel');
const dbConnector = require('livedb-mongo');
const sessionStoreFactory = require('connect-mongo')(webFramework);
const applicationLogic = require('../app');
const errorHandlerModule = require('./error');
const cacheClientModule = require('redis');
const resourceLocator = require('url');

const exportableServer = webFramework();

module.exports = exportableServer;

const acquireCacheClient = (envVariables) => {
    let clientHandle;
    if (envVariables.REDIS_HOST) {
        clientHandle = cacheClientModule.createClient(envVariables.REDIS_PORT, envVariables.REDIS_HOST);
        clientHandle.auth(envVariables.REDIS_PASSWORD);
    } else if (envVariables.REDISCLOUD_URL) {
        const parsedLocator = resourceLocator.parse(envVariables.REDISCLOUD_URL);
        clientHandle = cacheClientModule.createClient(parsedLocator.port, parsedLocator.hostname);
        clientHandle.auth(parsedLocator.auth.split(":")[1]);
    } else {
        clientHandle = cacheClientModule.createClient();
    }
    clientHandle.select(envVariables.REDIS_DB || 1);
    return clientHandle;
};

const keyValStore = acquireCacheClient(process.env);

const databaseConnectionUri = process.env.MONGO_URL || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/project';

const createDataManagementSystem = (dbUri, cache) => {
    return dataSyncEngine.createStore({
        db: dbConnector(dbUri + '?auto_reconnect', { safe: true }),
        redis: cache
    });
};
const dataManagementSystem = createDataManagementSystem(databaseConnectionUri, keyValStore);

const assignSessionIdentifier = (requestObject, responseObject, nextFunction) => {
    const dataProxy = requestObject.getModel();
    const retrieveOrCreateId = (session, proxy) => session.uniqueIdentifier || (session.uniqueIdentifier = proxy.id());
    const uniqueSessionId = retrieveOrCreateId(requestObject.session, dataProxy);
    dataProxy.set('_session.userId', uniqueSessionId);
    nextFunction();
};

const serverMiddlewareSequence = [
    webFramework.favicon(),
    webFramework.compress(),
    applicationLogic.scripts(dataManagementSystem),
    webFramework.static(__dirname + '/../../public'),
    clientCommsChannel(dataManagementSystem),
    dataManagementSystem.modelMiddleware(),
    webFramework.cookieParser(),
    webFramework.session({
        secret: process.env.SESSION_SECRET || 'A_DIFFERENT_SECRET_VALUE',
        store: new sessionStoreFactory({ url: databaseConnectionUri, safe: true })
    }),
    assignSessionIdentifier,
    applicationLogic.router(),
    exportableServer.router,
    errorHandlerModule()
];

serverMiddlewareSequence.forEach(middlewareFunction => {
    exportableServer.use(middlewareFunction);
});

exportableServer.all('*', (requestObject, responseObject, nextFunction) => {
    nextFunction('404: ' + requestObject.url);
});