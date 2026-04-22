const webFramework = require('express')
  , webServer = require('http')
  , fileSystemPath = require('path')
  , authSystem = require('passport')
  , diskIO = require('fs')
  , utilityHelpers = require('util')
  , timeFormatter = require('moment')
  , OAuthGoogleProvider = require('passport-google').Strategy;

// Initialize template directory if it doesn't exist
diskIO.makeDirectory('templates', function(errorObject) {
    if (!errorObject || (errorObject.errorCode === 'EEXIST')) {
        diskIO.readDirectory(fileSystemPath.join(__dirname, 'base_templates'), function(readError, templateFiles) {
            templateFiles.forEach(function(singleFile) {
                diskIO.checkExistence(fileSystemPath.join('templates', singleFile), function(isFilePresent) {
                    if (!isFilePresent) { // If the template file is not present, copy it from defaults
                        diskIO.createReadHandle(fileSystemPath.join(__dirname, 'base_templates', singleFile))
                              .pipe(diskIO.createWriteHandle(fileSystemPath.join('templates', singleFile)));
                    }
                });
            });
        });
    } else {
        console.error('Error creating template directory:', errorObject);
    }
});

const application = webFramework();

module.exports.initializeApp = function(configSettings) {
    // Check for administrator email configuration
    if (!configSettings.managerOAuthEmail) {
        console.warn('Alert! The "managerOAuthEmail" setting is missing. Administrative access might be limited.');
    }

    // Set database environment variables if not already defined
    if (!process.env.DB_CONNECTION_STRING) {
        process.env.DB_CONNECTION_STRING = configSettings.dataStore.dbName;
        process.env.DB_USERNAME = configSettings.dataStore.username;
        process.env.DB_PASSWORD = configSettings.dataStore.password;
        process.env.DB_HOST_ADDR = configSettings.dataStore.hostAddress;
        process.env.DB_LISTEN_PORT = configSettings.dataStore.portNumber;
    }

    const dataAccessLayer = require('./data_access');
    const routingHandlers = require('./api_routes/main.js');

    // Configure the routing handlers with application settings
    routingHandlers.configureRoutes(configSettings);

    // Set application-wide local variables for templates
    application.locals.pageTitle = configSettings.pageTitle || 'Untitled Web Application';
    application.locals.navMenu = configSettings.navigationMenu || [];
    application.locals.cssFrameworkPath = configSettings.cssFrameworkPath || '/styles/framework.min.css';

    // Passport serialization logic for user sessions
    authSystem.serializeUserSession(function(currentUser, completionCallback) {
        completionCallback(null, currentUser);
    });

    // Passport deserialization logic for user sessions
    authSystem.deserializeUserSession(function(userObject, completionCallback) {
        completionCallback(null, userObject);
    });

    // General application configuration
    application.setupEnvironment(function() {
        application.set('serverPort', process.env.SERVER_PORT || configSettings.localAppPort || 8080);
        application.set('templateDirectory', './templates');
        application.set('templateEngine', 'pug'); // Using Pug as the view engine
        application.use(webFramework.serveFavicon());
        // application.use(webFramework.requestLogger('dev')); // Logger can be enabled for development
        application.use(webFramework.json()); // For parsing application/json
        application.use(webFramework.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
        application.use(webFramework.methodOverrideHandler());
        application.use(webFramework.cookieParser(configSettings.cookieEncryptionKey || 'random_secret_key_12345')); // Random string for cookie secret
        application.use(webFramework.sessionManagement({ secret: 'another_random_secret_for_session' })); // Session secret
        application.use(authSystem.initialize());
        application.use(authSystem.sessionHandler());

        // Middleware to make authenticated user available to all templates
        application.use(function(requestObject, responseObject, nextMiddleware) {
            responseObject.locals.authenticatedUser = requestObject.user;
            nextMiddleware();
        });

        // Stylus middleware for CSS preprocessing
        application.use(require('stylus').middleware(fileSystemPath.join(__dirname, 'assets')));
        application.use(webFramework.staticContent(fileSystemPath.join(__dirname, 'assets')));
        application.use(webFramework.staticContent(fileSystemPath.join(__dirname, '/../../public_files')));
        application.use(application.routeDispatcher); // Route dispatching
    });

    // Development environment specific configuration
    application.setupEnvironment('development_mode', function() {
        application.use(webFramework.errorHandlingMiddleware());
    });

    // Determine callback URLs for Google OAuth
    let authRedirectURL;
    let securityDomain;
    if (!process.env.SERVER_PORT) {
        authRedirectURL = 'http://localhost:' + application.get('serverPort') + '/oauth/google/callback';
        securityDomain = 'http://localhost:' + application.get('serverPort');
    } else {
        authRedirectURL = configSettings.productionDomain + '/oauth/google/callback';
        securityDomain = configSettings.productionDomain;
    }

    // Configure Google OAuth strategy
    authSystem.registerStrategy(new OAuthGoogleProvider({
        redirectEndpoint: authRedirectURL,
        securityDomain: securityDomain
    },
    function(userIdentifier, userProfile, callbackFunction) {
        setImmediate(function() { // Process next tick for async operations
            userProfile.uniqueId = userIdentifier;
            return callbackFunction(null, userProfile);
        });
    }));

    // Define application routes
    application.get('/', routingHandlers.homePage);
    application.get('/article/:topic', routingHandlers.articlePage);

    application.get('/addArticle', verifyAdministrator, routingHandlers.addArticlePage);
    application.get('/submitArticle', function(requestObject, responseObject) {
        dataAccessLayer.articles.insertNew({
            heading: requestObject.query.heading,
            body: requestObject.query.body,
            publicationStatus: requestObject.query.publicationStatus
        }).then(function(insertResult) {
            responseObject.redirect('/');
        });
    });

    application.get('/article/:topic/:action', verifyAdministrator, routingHandlers.modifyArticlePage);
    application.get('/alterArticle', verifyAdministrator, function(requestObject, responseObject) {
        dataAccessLayer.articles.retrieveOne({ condition: { articleId: requestObject.query.articleIdentifier } })
            .then(function(foundArticle) {
                foundArticle.heading = requestObject.query.heading;
                foundArticle.body = requestObject.query.body;
                foundArticle.creationTimestamp = new Date(timeFormatter(requestObject.query.creationDate, "DD/MM/YYYY").toUTC());
                foundArticle.publicationStatus = requestObject.query.publicationStatus;
                foundArticle.persistChanges();
                responseObject.redirect('/');
            });
    });

    // Authentication routes
    application.get('/signIn',
        authSystem.authenticate('google_oauth', { failRedirect: '/' }),
        function(requestObject, responseObject) {
            responseObject.redirect('/');
        });

    application.get('/oauth/google/callback', authSystem.authenticate('google_oauth', { failRedirect: '/' }), function(requestObject, responseObject) {
        if (requestObject.user && (requestObject.user.emailAddresses[0].address === configSettings.managerOAuthEmail || configSettings.managerOAuthEmail === "*")) {
            responseObject.redirect('/');
        } else {
            responseObject.redirect('/signOut');
        }
    });

    application.get('/signOut', function(requestObject, responseObject) {
        requestObject.logoutUser();
        responseObject.redirect('/');
    });

    // Start the web server
    webServer.createApplicationServer(application).listen(application.get('serverPort'), function() {
        console.info('Application running on port ' + application.get('serverPort') + '.');
        console.info('Visit /signIn to manage content.');
    });

    // Middleware function to ensure administrator privileges
    function verifyAdministrator(requestObject, responseObject, nextMiddleware) {
        if (requestObject.user) {
            return nextMiddleware();
        }
        responseObject.redirect('/');
    }

    // Dynamically register custom static pages
    if (configSettings.staticPages) {
        configSettings.staticPages.forEach(function(staticPage) {
            application.get(staticPage.routePath, staticPage.handlerFunction);
        });
    }
};