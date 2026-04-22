const webEngine = require('express');
const networkAgent = require('http');
const pathUtils = require('path');
const authGuardian = require('passport');
const fileSystem = require('fs').promises;
const legacyFs = require('fs');
const GAuthScheme = require('passport-google').Strategy;
const cookieParser = require('cookie-parser');
const sessionManager = require('express-session');
const styleProcessor = require('stylus');

const currentModuleDirectory = __dirname;
const serverHost = webEngine();

// Utility for setting up view directory
const provisionViewAssets = async (baseModulePath, sourceResourcePath) => {
    const targetViewDirectory = pathUtils.join(baseModulePath, 'views');
    const defaultAssetTemplates = pathUtils.join(sourceResourcePath, 'default_views');

    try {
        await fileSystem.mkdir(targetViewDirectory, { recursive: true });
    } catch (creationError) {
        if (creationError.code !== 'EEXIST') {
            console.error('View directory creation failure:', creationError);
            return;
        }
    }

    try {
        const availableTemplates = await fileSystem.readdir(defaultAssetTemplates);
        for (const templateItem of availableTemplates) {
            const finalAssetPath = pathUtils.join(targetViewDirectory, templateItem);
            try {
                await fileSystem.access(finalAssetPath, legacyFs.constants.F_OK);
            } catch (existenceError) {
                if (existenceError.code === 'ENOENT') {
                    console.info(`Deploying default template: ${templateItem}`);
                    legacyFs.createReadStream(pathUtils.join(defaultAssetTemplates, templateItem))
                            .pipe(legacyFs.createWriteStream(finalAssetPath));
                } else {
                    console.error(`Error verifying/deploying ${templateItem}:`, existenceError);
                }
            }
        }
    } catch (readError) {
        console.error('Failed to enumerate or deploy default templates:', readError);
    }
};

// Database environment variable configuration
const establishDataStoreSettings = (dbConfiguration) => {
    if (!process.env.DB_NAME) {
        process.env.DB_NAME = dbConfiguration.dbName;
        process.env.DB_USER = dbConfiguration.dbUser;
        process.env.DB_PASS = dbConfiguration.dbPass;
        process.env.DB_HOST = dbConfiguration.dbHost;
        process.env.DB_PORT_NUM = dbConfiguration.dbPortNumber;
    }
};

// Global application variable population
const injectApplicationContext = (applicationInstance, parameters) => {
    applicationInstance.locals.applicationTitle = parameters.applicationTitle || 'Unassigned Application Title';
    applicationInstance.locals.primaryNavigation = parameters.mainNavigation || [];
    applicationInstance.locals.cssFrameworkPath = parameters.uiFrameworkPath || '/stylesheets/bootstrap.min.css';
};

// Authentication flow setup
const configureAuthMechanism = (authSystem) => {
    authSystem.serializeUser((userEntity, completionCallback) => {
        completionCallback(null, userEntity);
    });
    authSystem.deserializeUser((persistedObject, completionCallback) => {
        completionCallback(null, persistedObject);
    });
};

// Main server configuration and middleware application
const setupServerInfrastructure = (applicationInstance, serverParams, resourceRoot) => {
    applicationInstance.set('port', process.env.PORT || serverParams.devPort || 3000);
    applicationInstance.set('views', './views');
    applicationInstance.set('view engine', 'jade');

    applicationInstance.use(cookieParser(serverParams.cookieSignature || Math.random().toString(36).substring(7)));
    applicationInstance.use(sessionManager({
        secret: serverParams.sessionSecret || 'a_secure_session_key',
        resave: false,
        saveUninitialized: false
    }));
    applicationInstance.use(authGuardian.initialize());
    applicationInstance.use(authGuardian.session());

    applicationInstance.use((requestObject, responseObject, nextAction) => {
        responseObject.locals.authenticatedUser = requestObject.user;
        nextAction();
    });

    applicationInstance.use(styleProcessor.middleware({
        src: pathUtils.join(resourceRoot, 'resources')
    }));
    applicationInstance.use(webEngine.static(pathUtils.join(resourceRoot, 'resources')));
    applicationInstance.use(webEngine.static(pathUtils.join(resourceRoot, '/../../public')));

    applicationInstance.use(webEngine.json());
    applicationInstance.use(webEngine.urlencoded({ extended: true }));
    applicationInstance.use(webEngine.methodOverride());
};

// Development mode error handler
const implementDevErrorFeedback = (applicationInstance) => {
    if (applicationInstance.get('env') === 'development') {
        applicationInstance.use((issue, requestObject, responseObject, nextAction) => {
            console.error('Development Environment Error:', issue.stack);
            responseObject.status(issue.status || 500);
            responseObject.render('error', {
                message: issue.message,
                error: issue
            });
        });
    }
};

// Google authentication strategy initialization
const establishGoogleAuthStrategy = (authSystem, configParams, activePort) => {
    const authenticationReturnPath = '/auth/google/callback';
    const currentDomainHost = process.env.PORT
        ? configParams.productionHost
        : `http://localhost:${activePort}`;

    authSystem.use(new GAuthScheme({
        returnURL: `${currentDomainHost}${authenticationReturnPath}`,
        realm: currentDomainHost
    },
    (uniqueId, profileInformation, doneCallback) => {
        Promise.resolve().then(() => {
            profileInformation.uniqueIdentifier = uniqueId;
            return doneCallback(null, profileInformation);
        });
    }));
};

// Middleware for administrator verification
const verifyAdministrator = (request, response, proceed) => {
    if (request.user) {
        return proceed();
    }
    response.redirect('/');
};

// Endpoint registration
const registerApplicationEndpoints = (applicationInstance, routeFunctions, adminAuthCheck, setupConfig) => {
    applicationInstance.get('/', routeFunctions.homePage);
    applicationInstance.get('/item/:slug', routeFunctions.itemDetail);

    applicationInstance.get('/newEntry', adminAuthCheck, routeFunctions.newEntryForm);
    applicationInstance.get('/createEntry', (request, response) => {
        dataStore.blogItems.create({ title: request.query.title, content: request.query.content, status: request.query.status })
            .then(() => {
                response.redirect('/');
            })
            .catch(error => {
                console.error('Entry creation failure:', error);
                response.status(500).send('Entry creation failed.');
            });
    });

    applicationInstance.get('/item/:slug/:mode', adminAuthCheck, routeFunctions.editEntry);
    applicationInstance.get('/updateEntry', adminAuthCheck, (request, response) => {
        dataStore.blogItems.findOne({ where: { id: request.query.entryId } })
            .then(entryRecord => {
                if (!entryRecord) {
                    return response.status(404).send('Content item not found.');
                }
                entryRecord.title = request.query.title;
                entryRecord.content = request.query.content;
                const dateComponents = request.query.creationDate.split('/');
                if (dateComponents.length === 3) {
                    const monthIndex = parseInt(dateComponents[0], 10) - 1;
                    const dayValue = parseInt(dateComponents[1], 10);
                    const yearValue = parseInt(dateComponents[2], 10);
                    entryRecord.creationTimestamp = new Date(Date.UTC(yearValue, monthIndex, dayValue));
                }
                entryRecord.status = request.query.status;
                return entryRecord.save();
            })
            .then(() => {
                response.redirect('/');
            })
            .catch(error => {
                console.error('Entry update failure:', error);
                response.status(500).send('Entry update failed.');
            });
    });

    applicationInstance.get('/access',
        authGuardian.authenticate('google', { failureRedirect: '/' }),
        (request, response) => {
            response.redirect('/');
        });
    applicationInstance.get('/auth/google/callback', authGuardian.authenticate('google', { failureRedirect: '/' }), (request, response) => {
        if (request.user && (request.user.emails[0].value === setupConfig.privilegedUserEmail || setupConfig.privilegedUserEmail === "*")) {
            response.redirect('/');
        } else {
            response.redirect('/exit');
        }
    });

    applicationInstance.get('/exit', (request, response) => {
        request.logout((err) => {
            if (err) { console.error("Logout error:", err); }
            response.redirect('/');
        });
    });
};

// Integration of user-defined custom pages
const integrateCustomPageDefinitions = (applicationInstance, pageDefinitions) => {
    if (pageDefinitions && Array.isArray(pageDefinitions)) {
        pageDefinitions.forEach(pageEntry => {
            applicationInstance.get(pageEntry.routePath, pageEntry.actionFunction);
        });
    }
};

// Main application bootstrap function
module.exports.boot = async (initializationSettings) => {
    if (!initializationSettings.privilegedUserEmail) {
        console.warn('Configuration Alert! Administrator Google Email is not defined. Admin functionality will be restricted.');
    }

    establishDataStoreSettings(initializationSettings.database);

    const dataStore = require('./db');
    const endpointHandlers = require('./routes/index.js');
    endpointHandlers.configure(initializationSettings);

    injectApplicationContext(serverHost, initializationSettings);

    configureAuthMechanism(authGuardian);

    await provisionViewAssets(currentModuleDirectory, currentModuleDirectory);

    setupServerInfrastructure(serverHost, initializationSettings, currentModuleDirectory);

    implementDevErrorFeedback(serverHost);

    establishGoogleAuthStrategy(authGuardian, initializationSettings, serverHost.get('port'));

    registerApplicationEndpoints(serverHost, endpointHandlers, verifyAdministrator, initializationSettings);

    integrateCustomPageDefinitions(serverHost, initializationSettings.customWebPages);

    networkAgent.createServer(serverHost).listen(serverHost.get('port'), () => {
        console.info(`Web server active on port ${serverHost.get('port')}.`);
        console.info('Proceed to /access for login and content management.');
    });
};