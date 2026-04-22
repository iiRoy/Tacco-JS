const webFramework = require('express');
const realTimeData = require('derby');
const browserChannelSync = require('racer-browserchannel');
const mongoDataStoreProvider = require('livedb-mongo');
const connectMongoFactory = require('connect-mongo');
const primaryAppModule = require('../app');
const globalErrorHandling = require('./error');
const path = require('path');

// Initialize the main Express application instance.
const currentApplicationServer = module.exports = webFramework();

// --- Environmental Configuration Extraction ---

/**
 * Safely retrieve an environment variable, providing a default value if not set.
 * @param {string} key - The name of the environment variable.
 * @param {any} [defaultValue=null] - The value to return if the environment variable is not found.
 * @returns {any} The environment variable's value or the default.
 */
const retrieveEnvSetting = (key, defaultValue = null) => process.env[key] || defaultValue;

// --- Redis Client Setup for Caching and Pub/Sub ---

let dataCacheClient;
const redisConnectionDetails = {
    hostAddress: retrieveEnvSetting('REDIS_HOST'),
    portNumber: retrieveEnvSetting('REDIS_PORT'),
    authenticationKey: retrieveEnvSetting('REDIS_PASSWORD'),
    cloudServiceUrl: retrieveEnvSetting('REDISCLOUD_URL'),
    targetDatabase: parseInt(retrieveEnvSetting('REDIS_DB', '1'), 10) // Ensure database is an integer
};

if (redisConnectionDetails.hostAddress && redisConnectionDetails.portNumber) {
    // Explicit host and port configuration for Redis.
    console.info('Redis Connector: Initiating connection using provided host and port...');
    dataCacheClient = require('redis').createClient(redisConnectionDetails.portNumber, redisConnectionDetails.hostAddress);
    if (redisConnectionDetails.authenticationKey) {
        dataCacheClient.auth(redisConnectionDetails.authenticationKey);
    }
} else if (redisConnectionDetails.cloudServiceUrl) {
    // RedisCloud specific URL configuration.
    console.info('Redis Connector: Initiating connection via RedisCloud URL...');
    const urlProcessor = require('url'); // Localized import
    const parsedCloudUrl = urlProcessor.parse(redisConnectionDetails.cloudServiceUrl);
    dataCacheClient = require('redis').createClient(parseInt(parsedCloudUrl.port, 10), parsedCloudUrl.hostname);
    if (parsedCloudUrl.auth) {
        const authCredentials = parsedCloudUrl.auth.split(':');
        if (authCredentials.length > 1) {
            dataCacheClient.auth(authCredentials[1]); // Extracting password
        }
    }
} else {
    // Default local Redis instance fallback.
    console.warn('Redis Connector: No specific Redis configuration found. Connecting to default local instance...');
    dataCacheClient = require('redis').createClient();
}

// Select the specified Redis database.
dataCacheClient.select(redisConnectionDetails.targetDatabase, (err) => {
    if (err) {
        console.error(`Redis Connector: Failed to switch to database ${redisConnectionDetails.targetDatabase}. Error:`, err.message);
    } else {
        console.log(`Redis Connector: Successfully active on database ${redisConnectionDetails.targetDatabase}.`);
    }
});

// --- MongoDB Connection URI Determination ---

const primaryDatabaseUri = retrieveEnvSetting(
    'MONGO_URL',
    retrieveEnvSetting('MONGOHQ_URL', 'mongodb://localhost:27017/derby_dev_project') // Updated default DB name
);

// --- Derby Data Store Initialization ---

// The central store manages real-time data models and synchronization.
const derbyDataStore = realTimeData.createStore({
    db: mongoDataStoreProvider(`${primaryDatabaseUri}?auto_reconnect=true`, {
        useNewUrlParser: true, // Use the new URL parser
        useUnifiedTopology: true, // Use the new server discovery and monitoring engine
        safe: true // Ensure writes are acknowledged
    }),
    redis: dataCacheClient
});

/**
 * Middleware function to guarantee a unique user identifier in the session.
 * If a user ID is not found, a new one is generated and assigned.
 * @param {object} reqObj - The incoming HTTP request object.
 * @param {object} resObj - The outgoing HTTP response object.
 * @param {function} nextFn - Callback to invoke the next middleware in the chain.
 */
function ensureUserSessionId(reqObj, resObj, nextFn) {
    // Early exit if session is unavailable.
    if (!reqObj.session) {
        console.error('Session object is missing on request. User ID assignment skipped.');
        return nextFn();
    }

    const currentModel = reqObj.getModel();
    let uniqueUserIdentifier = reqObj.session.userId;

    if (!uniqueUserIdentifier) {
        // Generate a fresh unique ID if one doesn't exist for the current session.
        uniqueUserIdentifier = currentModel.id();
        reqObj.session.userId = uniqueUserIdentifier;
        console.debug(`Generated new session ID for user: ${uniqueUserIdentifier}`);
    } else {
        console.debug(`Utilizing existing session ID: ${uniqueUserIdentifier}`);
    }

    // Store the user ID in the model's session scope for persistence.
    currentModel.set('_session.userId', uniqueUserIdentifier);
    nextFn(); // Proceed to the subsequent middleware.
}

// --- Express Application Middleware Chain ---

// Configure the MongoDB-backed session store.
const MongoSessionStorage = connectMongoFactory(webFramework);
const activeSessionStore = new MongoSessionStorage({
    url: primaryDatabaseUri,
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    collection: 'web_user_sessions', // Custom collection name for sessions
    ttl: 1000 * 60 * 60 * 24 * 30, // Session Time-To-Live: 30 days
    autoRemove: 'interval',
    autoRemoveInterval: 10 // Removes expired sessions every 10 minutes
});

currentApplicationServer
    // 1. Favicon middleware: serves the site's icon.
    .use(webFramework.favicon())

    // 2. Compression middleware: GZIPs HTTP responses for faster page loads.
    .use(webFramework.compress())

    // 3. Application script bundles: serves client-side JavaScript generated by Derby.
    .use(primaryAppModule.scripts(derbyDataStore))

    // 4. Static file serving: provides access to public assets like CSS, images, etc.
    .use(webFramework.static(path.join(__dirname, '..', '..', 'public_assets'))) // Renamed public folder, used path.join

    // 5. Browser channel integration: enables real-time client-server communication for Derby.
    .use(browserChannelSync(derbyDataStore))

    // 6. Model middleware: attaches `req.getModel()` for accessing Derby models in routes.
    .use(derbyDataStore.modelMiddleware())

    // 7. Cookie parser: extracts cookie data from incoming requests.
    .use(webFramework.cookieParser(retrieveEnvSetting('APP_COOKIE_SECRET', 'a_default_secret_for_cookies'))) // Added cookie secret

    // 8. Session management: configures user sessions with MongoDB persistence.
    .use(webFramework.session({
        secret: retrieveEnvSetting('APP_SESSION_SECRET', 'this_is_a_fallback_session_secret_key'), // Renamed, used helper
        store: activeSessionStore, // Using the custom MongoStore instance
        resave: false, // Prevents session from being saved back to the store if it was never modified
        saveUninitialized: false, // Prevents saving new sessions that have not yet been modified
        cookie: {
            secure: retrieveEnvSetting('NODE_ENV') === 'production', // Only send cookie over HTTPS in production
            httpOnly: true, // Prevents client-side JavaScript from accessing cookie data
            maxAge: 1000 * 60 * 60 * 24 * 14 // Cookie expiration after 14 days
        }
    }))

    // 9. Custom user session identifier middleware.
    .use(ensureUserSessionId)

    // 10. Main application router: defines the primary routes for the application.
    .use(primaryAppModule.router())

    // 11. Global error handling middleware.
    .use(globalErrorHandling()); // Renamed `error()`

// --- Final Catch-all Route for Unhandled Requests ---

// This route acts as a fallback for any requests that have not been matched
// by previous middleware or application routes, indicating a 404 Not Found error.
currentApplicationServer.all('*', (requestObject, responseObject, nextCallback) => {
    const requestedResourcePath = requestObject.originalUrl; // Using originalUrl
    const notFoundMessage = `The requested resource '${requestedResourcePath}' could not be located on this server.`;
    console.warn(`HTTP 404 - Not Found: ${notFoundMessage}`); // Enhanced logging
    nextCallback(new Error(`404: ${notFoundMessage}`)); // Passing an Error object for better error handling flow
});