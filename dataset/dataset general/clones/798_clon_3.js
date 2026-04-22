const webFramework = require('express');
const webServer = require('http');
const fileSystemPath = require('path');
const authenticationManager = require('passport');
const diskOperations = require('fs');
const timeUtility = require('moment');
const OAuthGoogleStrategy = require('passport-google').Strategy;

// Define application constants for better readability and maintainability.
const DEFAULT_VIEW_DIRECTORY_NAME = 'views';
const SOURCE_VIEW_TEMPLATES_PATH = fileSystemPath.join(__dirname, 'default_views');
const FALLBACK_LOCAL_SERVER_PORT = 3000;
const SESSION_SECRET_STRING_LENGTH = 32;
const ARTICLE_DATE_INPUT_FORMAT = "MM/DD/YYYY";

/**
 * Ensures the application's view directory exists and populates it with default templates
 * if they are not already present. This function is critical for initial setup.
 */
function provisionApplicationViews() {
  diskOperations.mkdir(DEFAULT_VIEW_DIRECTORY_NAME, { recursive: true }, (directoryCreationError) => {
    if (directoryCreationError && directoryCreationError.code !== 'EEXIST') {
      console.error('CRITICAL: Failed to create application views directory:', directoryCreationError.message);
      process.exit(1); // Abort startup if view directory cannot be prepared.
    }

    // Attempt to read and copy default templates from the source.
    diskOperations.readdir(SOURCE_VIEW_TEMPLATES_PATH, (readOperationError, directoryEntries) => {
      if (readOperationError) {
        console.warn('NOTICE: Default view templates source not found or inaccessible:', readOperationError.message);
        return; // Application can still run, but without default views.
      }

      directoryEntries.forEach((templateFileName) => {
        const sourceTemplateFullPath = fileSystemPath.join(SOURCE_VIEW_TEMPLATES_PATH, templateFileName);
        const destinationTemplateFullPath = fileSystemPath.join(DEFAULT_VIEW_DIRECTORY_NAME, templateFileName);

        // Check if the template already exists in the target directory.
        diskOperations.access(destinationTemplateFullPath, diskOperations.constants.F_OK, (existenceCheckError) => {
          if (existenceCheckError) { // File does not exist, proceed with copying.
            diskOperations.createReadStream(sourceTemplateFullPath)
              .pipe(diskOperations.createWriteStream(destinationTemplateFullPath))
              .on('error', (pipeStreamError) => console.error(`ERROR: Failed to copy default template ${templateFileName}:`, pipeStreamError.message));
          }
        });
      });
    });
  });
}

// Execute the view provisioning during application startup.
provisionApplicationViews();

// Initialize the primary Express application instance.
const applicationInstance = webFramework();

/**
 * Parses a date string into a UTC Date object.
 * @param {string} dateString - The date string to parse.
 * @returns {Date} A Date object, or the current date if parsing fails.
 */
function parseArticleCreationDate(dateString) {
  const parsedMoment = timeUtility(dateString, ARTICLE_DATE_INPUT_FORMAT, true); // Strict parsing.
  return parsedMoment.isValid() ? parsedMoment.utc().toDate() : new Date(); // Fallback to current date.
}

/**
 * Main function to initialize and start the web server.
 * @param {object} configurationSettings - Application configuration object.
 */
module.exports.initializeServer = function(configurationSettings) {
  // Essential configuration validation guard.
  if (!configurationSettings || typeof configurationSettings !== 'object') {
    console.error('FATAL: Server initialization requires a valid configuration object. Aborting.');
    process.exit(1);
  }

  // Admin access configuration and logging.
  const adminAccessEmail = configurationSettings.adminGoogleEmail;
  if (!adminAccessEmail) {
    console.warn('SECURITY WARNING: "adminGoogleEmail" is not configured. Admin features may be disabled or insecure.');
  } else if (adminAccessEmail === "*") {
    console.log('ADMIN ACCESS: All successfully authenticated Google users will have administrative privileges.');
  }

  /**
   * Sets database connection parameters as environment variables.
   * @param {object} dbConfiguration - Database configuration object.
   */
  const setDatabaseConnectionVariables = (dbConfiguration) => {
    if (!dbConfiguration) {
      console.warn('DATABASE CONFIG: No database configuration provided. Database operations may fail.');
      return;
    }
    process.env.DB_NAME = dbConfiguration.database;
    process.env.DB_USER = dbConfiguration.user;
    process.env.DB_PASSWORD = dbConfiguration.password;
    process.env.DB_HOST = dbConfiguration.host;
    process.env.DB_PORT = dbConfiguration.dbPort;
  };

  // Apply database configuration only if environment variables are not already set.
  if (!process.env.DB_NAME && configurationSettings.database) {
    setDatabaseConnectionVariables(configurationSettings.database);
  } else if (process.env.DB_NAME) {
    console.log('DATABASE CONFIG: Database environment variables already present. Skipping configuration from settings.');
  }

  // Dynamically load database and endpoint handlers.
  const dataStore = require('./db');
  const endpointHandlers = require('./routes/index.js');
  endpointHandlers.setServerConfiguration(configurationSettings); // Renamed method for clarity.

  // Configure application-wide local variables for template rendering.
  applicationInstance.locals.applicationTitle = configurationSettings.title || 'Default Web Application';
  applicationInstance.locals.navigationStructure = configurationSettings.menu || [];
  applicationInstance.locals.mainCssFrameworkPath = configurationSettings.bootstrapPath || '/stylesheets/bootstrap.min.css';
  applicationInstance.locals.currentCopyrightYear = new Date().getFullYear(); // Added dynamic year.

  // Authentication Manager (Passport.js) setup for user sessions.
  authenticationManager.serializeUser((userProfileObject, completionCallback) => {
    completionCallback(null, userProfileObject);
  });

  authenticationManager.deserializeUser((serializedObject, completionCallback) => {
    completionCallback(null, serializedObject);
  });

  // Determine the server port from environment, configuration, or default.
  const activeServerPort = process.env.PORT || configurationSettings.localPort || FALLBACK_LOCAL_SERVER_PORT;
  applicationInstance.set('port', activeServerPort);
  applicationInstance.set('views', DEFAULT_VIEW_DIRECTORY_NAME);
  applicationInstance.set('view engine', 'jade'); // Using Jade/Pug as template engine.

  // Middleware pipeline configuration for the application.
  applicationInstance.use(webFramework.json()); // Handle JSON request bodies.
  applicationInstance.use(webFramework.urlencoded({ extended: true })); // Handle URL-encoded request bodies.
  applicationInstance.use(webFramework.methodOverride()); // Enable PUT/DELETE via POST method simulation.
  
  // Generate a cryptographically strong session secret if not provided.
  const sessionCookieSecret = configurationSettings.cookieSecret || 
                              Array.from({ length: SESSION_SECRET_STRING_LENGTH }, () => Math.random().toString(36)[2] || 'a').join('');
  applicationInstance.use(webFramework.cookieParser(sessionCookieSecret));
  applicationInstance.use(webFramework.session({
    secret: sessionCookieSecret,
    resave: false, // Avoids saving session if not modified.
    saveUninitialized: true // Saves new sessions even if not modified.
  }));
  applicationInstance.use(authenticationManager.initialize());
  applicationInstance.use(authenticationManager.session());

  // Custom middleware to inject authenticated user data into template locals.
  applicationInstance.use((clientRequest, serverResponse, nextMiddleware) => {
    serverResponse.locals.authenticatedUserProfile = clientRequest.user;
    nextMiddleware();
  });

  // Stylus CSS preprocessor middleware.
  const stylusCompilerMiddleware = require('stylus').middleware({
    src: fileSystemPath.join(__dirname, 'resources'),
    compile: function(stylesheetString, filePath) { // Added custom compilation options.
      return require('stylus')(stylesheetString)
        .set('filename', filePath)
        .set('compress', process.env.NODE_ENV === 'production'); // Compress in production.
    }
  });
  applicationInstance.use(stylusCompilerMiddleware);

  // Serve static assets from defined directories.
  applicationInstance.use('/static_assets', webFramework.static(fileSystemPath.join(__dirname, 'resources'))); // Custom URL prefix.
  applicationInstance.use(webFramework.static(fileSystemPath.join(__dirname, '..', '..', 'public'))); // Parent project's public folder.

  // Environment-specific error handling.
  if (process.env.NODE_ENV === 'development') {
    applicationInstance.use(webFramework.errorHandler()); // Detailed error reporting in development.
  } else {
    // Generic error handler for production to prevent sensitive information leakage.
    applicationInstance.use((errorObject, clientRequest, serverResponse, nextMiddleware) => {
      console.error('PRODUCTION ERROR:', errorObject.message);
      serverResponse.status(500).send('An internal server error occurred. Please try again later.');
    });
  }

  // Dynamic determination of Google OAuth callback and realm URLs.
  let googleAuthReturnAddress, googleAuthSecurityDomain;
  if (!process.env.PORT) { // Local development setup.
    googleAuthReturnAddress = `http://localhost:${activeServerPort}/auth/google/return`;
    googleAuthSecurityDomain = `http://localhost:${activeServerPort}`;
  } else { // Production or deployed environment.
    googleAuthReturnAddress = `${configurationSettings.liveDomain}/auth/google/return`;
    googleAuthSecurityDomain = configurationSettings.liveDomain;
  }

  // Configure the Google OAuth authentication strategy.
  const googleStrategyConfiguration = {
    returnURL: googleAuthReturnAddress,
    realm: googleAuthSecurityDomain,
    passReqToCallback: true // Allows accessing the request object in the verify callback.
  };

  authenticationManager.use(new OAuthGoogleStrategy(googleStrategyConfiguration,
    (clientRequest, googleUniqueId, userProfileData, completionCallback) => {
      process.nextTick(() => {
        userProfileData.externalProviderId = googleUniqueId; // Renamed property.
        console.log(`User authenticated via Google: ${userProfileData.displayName} (${userProfileData.emails[0].value})`);
        return completionCallback(null, userProfileData);
      });
    }
  ));

  // --- Application Endpoint Definitions ---

  // Public-facing content routes.
  applicationInstance.get('/', endpointHandlers.renderHomePage); // Renamed handler.
  applicationInstance.get('/blog/:articleSlug', endpointHandlers.displaySingleArticle); // Renamed path and handler.

  // Administrator-only routes for content management.
  applicationInstance.get('/content/new', authorizeAdministratorAccess, endpointHandlers.showArticleCreationForm); // Renamed path and handler.
  applicationInstance.post('/content/save', authorizeAdministratorAccess, (clientRequest, serverResponse) => { // Changed to POST method.
    const { articleTitle, articleContent, articleStatus } = clientRequest.body; // Accessing body for POST data.
    dataStore.posts.create({ title: articleTitle, content: articleContent, status: articleStatus })
      .then((operationResult) => { // Using Promises for modern async handling.
        console.log('New article successfully created with ID:', operationResult.id);
        serverResponse.redirect('/');
      })
      .catch((creationError) => {
        console.error('ERROR: Failed to create new article:', creationError.message);
        serverResponse.status(500).send('Failed to create article. Please check server logs.');
      });
  });

  applicationInstance.get('/content/:articleSlug/edit', authorizeAdministratorAccess, endpointHandlers.showArticleEditForm); // Renamed path and handler.
  applicationInstance.post('/content/update', authorizeAdministratorAccess, (clientRequest, serverResponse) => { // Changed to POST method.
    const { articleId, articleTitle, articleContent, articleCreationTimestamp, articleStatus } = clientRequest.body; // Accessing body.
    
    dataStore.posts.findByPk(articleId) // Updated Sequelize method from 'find' to 'findByPk'.
      .then((blogEntryRecord) => {
        if (!blogEntryRecord) {
          return serverResponse.status(404).send('Article record not found for update.');
        }
        blogEntryRecord.title = articleTitle;
        blogEntryRecord.content = articleContent;
        blogEntryRecord.createdAt = parseArticleCreationDate(articleCreationTimestamp);
        blogEntryRecord.status = articleStatus;
        return blogEntryRecord.save();
      })
      .then(() => {
        console.log('Article record updated for ID:', articleId);
        serverResponse.redirect('/');
      })
      .catch((updateError) => {
        console.error('ERROR: Failed to update article record:', updateError.message);
        serverResponse.status(500).send('Failed to update article. Please check server logs.');
      });
  });

  // Authentication related endpoints.
  applicationInstance.get('/auth/google/initiate', // Renamed login path.
    authenticationManager.authenticate('google', { failureRedirect: '/auth/status/failed' }),
    (clientRequest, serverResponse) => {
      // This handler is typically not reached as Passport redirects upon success/failure.
      serverResponse.redirect('/');
    });

  applicationInstance.get('/auth/google/return',
    authenticationManager.authenticate('google', { failureRedirect: '/auth/status/failed' }),
    (clientRequest, serverResponse) => {
      const authenticatedUser = clientRequest.user;
      if (authenticatedUser && authenticatedUser.emails && authenticatedUser.emails.length > 0) {
        const primaryUserEmail = authenticatedUser.emails[0].value;
        if (adminAccessEmail === "*" || primaryUserEmail === adminAccessEmail) {
          serverResponse.redirect('/'); // Admin user successfully logged in.
        } else {
          console.warn(`ACCESS DENIED: Non-admin user attempted login: ${primaryUserEmail}`);
          serverResponse.redirect('/auth/status/unauthorized'); // Redirect for non-admin users.
        }
      } else {
        console.warn('Google authentication did not return a complete user profile.');
        serverResponse.redirect('/auth/status/failed');
      }
    });

  // New routes to provide specific feedback on authentication status.
  applicationInstance.get('/auth/status/failed', (clientRequest, serverResponse) => {
    serverResponse.status(401).render('auth-failed', { message: 'Authentication process could not be completed.' });
  });
  applicationInstance.get('/auth/status/unauthorized', (clientRequest, serverResponse) => {
    serverResponse.status(403).render('auth-unauthorized', { message: 'You do not possess the necessary administrative privileges.' });
  });

  applicationInstance.get('/auth/signout', (clientRequest, serverResponse) => { // Renamed logout to signout.
    clientRequest.logout((logoutError) => { // Modern Passport.js logout takes a callback.
      if (logoutError) {
        console.error('ERROR: Problem encountered during user signout:', logoutError);
        return serverResponse.status(500).send('Failed to sign out successfully.');
      }
      serverResponse.redirect('/');
    });
  });

  // Start the underlying HTTP server.
  webServer.createServer(applicationInstance).listen(activeServerPort, () => {
    console.log(`Web application server is now listening on port ${activeServerPort}.`);
    console.log('To manage content, navigate to /auth/google/initiate for administrator login.');
  });

  /**
   * Middleware function to enforce administrator access for specific routes.
   * @param {object} clientRequest - The incoming client request.
   * @param {object} serverResponse - The server response object.
   * @param {function} nextMiddleware - Callback to pass control to the next middleware.
   */
  function authorizeAdministratorAccess(clientRequest, serverResponse, nextMiddleware) {
    if (clientRequest.isAuthenticated && clientRequest.isAuthenticated()) { // Check if user is authenticated.
      const authenticatedUser = clientRequest.user;
      if (authenticatedUser && authenticatedUser.emails && authenticatedUser.emails.length > 0) {
        const userEmail = authenticatedUser.emails[0].value;
        if (adminAccessEmail === "*" || userEmail === adminAccessEmail) {
          return nextMiddleware(); // User is authenticated and authorized as admin.
        }
      }
    }
    // If not authenticated or not authorized, redirect to an unauthorized page.
    console.warn('ACCESS ATTEMPT DENIED: Administrator privileges required for this action.');
    serverResponse.status(403).redirect('/auth/status/unauthorized');
  }

  // Integrate dynamic custom pages from configuration.
  if (configurationSettings.customApplicationPages && Array.isArray(configurationSettings.customApplicationPages)) {
    configurationSettings.customApplicationPages.forEach((pageDefinition) => {
      if (pageDefinition.routeEndpoint && typeof pageDefinition.requestHandler === 'function') { // Renamed properties.
        applicationInstance.get(pageDefinition.routeEndpoint, pageDefinition.requestHandler);
        console.log(`Custom page registered: ${pageDefinition.routeEndpoint}`);
      } else {
        console.warn('WARNING: Invalid custom page definition encountered:', pageDefinition);
      }
    });
  }
};