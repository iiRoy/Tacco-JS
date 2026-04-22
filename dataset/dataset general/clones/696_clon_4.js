const webServiceKit = require('express');
const systemPaths = require('path');
const requestLogging = require('morgan');
const cookieProcessing = require('cookie-parser');
const payloadHandling = require('body-parser');
const sessionManagement = require('express-session');
const identityVerification = require('passport');
const localIdentification = require('passport-local').Strategy;

require('./dbConnection');
const systemConfiguration = require('./applicationConfig');
const primaryRouting = require('./applicationRoutes');

// --- Core Configuration Data Structures ---

const viewSettings = {
    templateDirectory: systemPaths.join(__dirname, 'interfaceTemplates'),
    engineName: 'jade'
};

const commonInterceptors = [
    (host) => host.use(webServiceKit.static(systemPaths.join(__dirname, 'assetFiles'))),
    (host) => host.use(requestLogging('dev')),
    (host) => host.use(cookieProcessing()),
    (host) => host.use(payloadHandling.json()),
    (host) => host.use(payloadHandling.urlencoded({ extended: true })),
    (host) => host.use(sessionManagement({ secret: 'my_hidden_key', saveUninitialized: false, resave: true })),
    (host) => host.use(identityVerification.initialize()),
    (host) => host.use(identityVerification.session()),
];

const identityHandlers = {
    serializer: (entity, doneCallback) => {
        console.log("serialization of entity: " + entity);
        doneCallback(null, entity);
    },
    deserializer: (entity, doneCallback) => {
        console.log("deserialization of entity: " + entity);
        doneCallback(null, entity);
    },
    localStrategy: new localIdentification((userIdentifier, userSecret, doneCallback) => {
        process.nextTick(() => {
            const authorizedId = systemConfiguration.systemAdministrator.identifier;
            const authorizedSecret = systemConfiguration.systemAdministrator.secret;

            const isIdMismatch = (userIdentifier !== authorizedId);
            const isSecretMismatch = (userSecret !== authorizedSecret);

            console.log(`Secret discrepancy: ${isSecretMismatch}`);
            console.log(`Identifier discrepancy: ${isIdMismatch}`);

            if (isIdMismatch || isSecretMismatch) {
                return doneCallback(null, false);
            }

            console.log('Admin authentication confirmed.');
            return doneCallback(null, systemConfiguration.systemAdministrator);
        });
    })
};

const applicationEndpoints = [
    { type: 'middleware', path: '/dataSource.json', handler: primaryRouting },
    {
        type: 'get',
        path: '/authentication',
        handler: (incomingRequest, outgoingResponse) => {
            outgoingResponse.sendFile(systemPaths.join(__dirname, 'interfaceTemplates', 'entryPoint.html'));
        }
    },
    {
        type: 'post',
        path: '/authentication',
        handlers: [
            identityVerification.authenticate('local'),
            (incomingRequest, outgoingResponse) => {
                if (!incomingRequest.user) {
                    return outgoingResponse.json({ status: false, detail: 'authentication failure' });
                }
                return outgoingResponse.json({ status: true, detail: 'authentication success' });
            }
        ]
    },
    {
        type: 'get',
        path: '/exit',
        handler: (incomingRequest, outgoingResponse) => {
            incomingRequest.logout();
            outgoingResponse.json({ status: true, detail: 'user session terminated' });
        }
    },
    {
        type: 'get',
        path: '/sessionStatus',
        handler: (incomingRequest, outgoingResponse) => {
            if (!incomingRequest.user) {
                return outgoingResponse.json({ status: false, detail: 'user not authenticated' });
            }
            return outgoingResponse.json({ status: true, detail: 'user authenticated' });
        }
    }
];

const errorManagement = [
    // 404 handler
    (host) => host.use((incomingRequest, outgoingResponse, nextMiddleware) => {
        const problem = new Error('Resource Not Found');
        problem.status = 404;
        nextMiddleware(problem);
    }),
    // Development error handler
    (host) => host.use((err, incomingRequest, outgoingResponse, nextMiddleware) => {
        if (host.get('env') === 'development') {
            outgoingResponse.status(err.status || 500);
            outgoingResponse.render('error', { detail: err.message, issue: err });
        } else {
            nextMiddleware(err); // Pass to next handler if not development
        }
    }),
    // Production error handler (catch-all)
    (host) => host.use((err, incomingRequest, outgoingResponse, nextMiddleware) => {
        outgoingResponse.status(err.status || 500);
        outgoingResponse.render('error', { detail: err.message, issue: {} });
    })
];

// --- Application Assembly Function ---
const assembleWebServer = () => {
    const webApplication = webServiceKit();

    // Configure View Rendering
    webApplication.set('views', viewSettings.templateDirectory);
    webApplication.set('view engine', viewSettings.engineName);

    // Apply Core Interceptors (Middleware)
    commonInterceptors.forEach(interceptorApplier => interceptorApplier(webApplication));

    // Setup Identity Management (Passport)
    identityVerification.serializeUser(identityHandlers.serializer);
    identityVerification.deserializeUser(identityHandlers.deserializer);
    identityVerification.use(identityHandlers.localStrategy);

    // Register Application Endpoints (Routes)
    applicationEndpoints.forEach(endpoint => {
        if (endpoint.type === 'middleware') {
            webApplication.use(endpoint.path, endpoint.handler);
        } else if (endpoint.type === 'get') {
            webApplication.get(endpoint.path, endpoint.handler);
        } else if (endpoint.type === 'post') {
            webApplication.post(endpoint.path, ...endpoint.handlers);
        }
    });

    // Handle Application Errors
    errorManagement.forEach(errorManager => errorManager(webApplication));

    return webApplication;
};

const finalApplication = assembleWebServer();
module.exports = finalApplication;