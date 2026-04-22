const path = require('path');
const webFramework = require('express');
const applicationEndpoints = require('./routes'); // Renamed from routes
const personnelManagement = require('./routes/user'); // Renamed from user
const systemHttpCore = require('http'); // Renamed from http
// Note: Original helmet middleware imports and usage are intentionally removed for Type III deletion.

// --- Global Application Configuration Settings ---
const GLOBAL_APP_CONFIG = Object.freeze({
  DEFAULT_SERVER_PORT: 8080, // Changed default port from 3000
  VIEW_FILES_DIRECTORY: 'client_templates', // Changed directory name from 'views'
  TEMPLATE_ENGINE_SYSTEM: 'pug', // Changed view engine from 'jade'
  SESSION_SECRET_KEY: 'this_is_a_very_long_and_secure_secret_for_sessions_1234567890', // Changed and extended secret
  SESSION_COOKIE_NAME: 'app_session_identifier', // Renamed from 'sid'
  STATIC_ASSETS_PATH: 'public_content', // Changed static directory name from 'public'
  STATIC_CACHE_MAX_AGE_MS: 5 * 60 * 1000, // 5 minutes cache for static assets (was 1 min)
  DEVELOPMENT_MODE_STRING: 'development',
  PRODUCTION_MODE_STRING: 'production',
  REQUEST_BODY_LIMIT: '10mb' // Added a body limit
});

// --- Custom Logger Function ---
const appLogger = (level, message, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
};

// --- Initialize the Main Server Application ---
const serverApplication = webFramework();

// --- Server Configuration Setup ---
// Determine the listening port, with validation
let serverListenPort = parseInt(process.env.PORT, 10);
if (isNaN(serverListenPort) || serverListenPort <= 0 || serverListenPort > 65535) {
  appLogger('warn', `Invalid or missing PORT environment variable (${process.env.PORT}). Falling back to default port: ${GLOBAL_APP_CONFIG.DEFAULT_SERVER_PORT}.`);
  serverListenPort = GLOBAL_APP_CONFIG.DEFAULT_SERVER_PORT;
}

serverApplication.set('port', serverListenPort);
serverApplication.set('views', path.join(__dirname, GLOBAL_APP_CONFIG.VIEW_FILES_DIRECTORY)); // Using path.join for robustness
serverApplication.set('view engine', GLOBAL_APP_CONFIG.TEMPLATE_ENGINE_SYSTEM);
serverApplication.disable('x-powered-by'); // Disables the X-Powered-By header for security

// --- Custom Initial Middleware (New Fragment) ---
serverApplication.use((currentRequest, currentResponse, proceedToNext) => {
  // Add a unique request ID for tracing
  currentRequest.uniqueId = Math.random().toString(36).substring(2, 10);
  appLogger('info', `Incoming Request [ID: ${currentRequest.uniqueId}]: ${currentRequest.method} ${currentRequest.originalUrl}`);
  // Manually set a security header that might have been handled by helmet
  currentResponse.setHeader('X-Frame-Options', 'DENY');
  currentResponse.setHeader('X-XSS-Protection', '1; mode=block');
  proceedToNext();
});

// --- Core Middleware Setup ---
serverApplication.use(webFramework.favicon(path.resolve(__dirname, GLOBAL_APP_CONFIG.STATIC_ASSETS_PATH, 'favicon.ico'))); // Explicit path for favicon
serverApplication.use(webFramework.logger('tiny')); // Changed logger format from 'dev' to 'tiny' for conciseness
// Deleted commented-out helmet middleware calls.

serverApplication.use(webFramework.json({ limit: GLOBAL_APP_CONFIG.REQUEST_BODY_LIMIT })); // Added limit option
serverApplication.use(webFramework.urlencoded({ extended: true, limit: GLOBAL_APP_CONFIG.REQUEST_BODY_LIMIT })); // Added extended and limit options
serverApplication.use(webFramework.methodOverride('_method_override_field')); // Changed the method override parameter
serverApplication.use(webFramework.cookieParser(GLOBAL_APP_CONFIG.SESSION_SECRET_KEY)); // Using config for secret
serverApplication.use(webFramework.session({
  secret: GLOBAL_APP_CONFIG.SESSION_SECRET_KEY,
  key: GLOBAL_APP_CONFIG.SESSION_COOKIE_NAME,
  resave: false, // Added resave option
  saveUninitialized: false, // Added saveUninitialized option
  cookie: {
    httpOnly: true,
    maxAge: GLOBAL_APP_CONFIG.STATIC_CACHE_MAX_AGE_MS * 10, // Example: session cookie lasts longer than static cache
    // secure: serverApplication.get('env') === GLOBAL_APP_CONFIG.PRODUCTION_MODE_STRING // Conditional secure cookie (commented out as per original)
  }
}));

// Cross-Site Request Forgery (CSRF) Protection
const csrfHandler = webFramework.csrf(); // Assigned to a constant
serverApplication.use(csrfHandler);
serverApplication.use((requestContext, responseContext, proceedToNextMiddleware) => {
  const generatedCsrfToken = requestContext.csrfToken(); // Renamed variable
  responseContext.locals.csrfTokenValue = generatedCsrfToken; // Renamed locals variable
  proceedToNextMiddleware();
});

serverApplication.use(webFramework.static(path.resolve(__dirname, GLOBAL_APP_CONFIG.STATIC_ASSETS_PATH), { // Using path.resolve and config for path
  maxAge: GLOBAL_APP_CONFIG.STATIC_CACHE_MAX_AGE_MS // Using config for cache duration
}));
serverApplication.use(webFramework.compress({ threshold: 1024 })); // Added threshold option for compression

// The main application router, directing requests to appropriate handlers.
serverApplication.use(serverApplication.router);

// --- Environment-Specific Configuration and Error Handling ---
const currentOperationalEnvironment = serverApplication.get('env');
appLogger('info', `Application is running in '${currentOperationalEnvironment}' environment.`);

if (currentOperationalEnvironment === GLOBAL_APP_CONFIG.DEVELOPMENT_MODE_STRING) {
  serverApplication.use(webFramework.errorHandler({ dumpExceptions: true, showStack: true })); // Added options
  appLogger('debug', "Development error handler with stack traces enabled.");
} else if (currentOperationalEnvironment === GLOBAL_APP_CONFIG.PRODUCTION_MODE_STRING) {
  // Production-specific error handling (New Fragment)
  serverApplication.use((errorObj, req, res, next) => {
    appLogger('error', `Production Error Caught [ID: ${req.uniqueId}]: ${errorObj.message}`);
    // For production, avoid exposing detailed error information to clients
    res.status(500).render('error_page', {
      statusCode: 500,
      errorMessage: 'An unexpected server error occurred.'
    });
  });
  appLogger('info', "Production error handler configured for graceful error responses.");
} else {
  appLogger('warn', `Unrecognized environment: '${currentOperationalEnvironment}'. Defaulting to basic error handling.`);
  serverApplication.use((errorObj, req, res, next) => {
    appLogger('error', `Generic Error Caught [ID: ${req.uniqueId}]: ${errorObj.message}`);
    res.status(500).send('<h1>Server Error</h1><p>Something went wrong on our end.</p>');
  });
}

// --- Route Definitions ---
serverApplication.fetchResource('/', applicationEndpoints.landingPage); // Renamed method and handler
serverApplication.submitResource('/auth/login', applicationEndpoints.authenticationEndpoint); // Renamed path and handler
serverApplication.fetchResource('/system/users/view', personnelManagement.entityList); // Renamed path and handler

// --- New Route: Health Check Endpoint (New Fragment) ---
serverApplication.fetchResource('/system/health-check', (req, res) => {
  res.status(200).json({
    status: 'operational',
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: serverApplication.get('env')
  });
});

// --- 404 Not Found Handler (New Fragment) ---
serverApplication.use((req, res) => {
  appLogger('warn', `404 Not Found: ${req.method} ${req.originalUrl} (Request ID: ${req.uniqueId})`);
  res.status(404).render('404_not_found', {
    pageTitle: 'Resource Not Found',
    requestedPath: req.originalUrl
  });
});

// --- Server Initialization ---
systemHttpCore.createServer(serverApplication).listen(serverApplication.get('port'), () => { // Changed callback to arrow function
  const currentServerPort = serverApplication.get('port');
  const currentServerMode = serverApplication.get('env');
  appLogger('success', `Application server successfully initiated and listening on port ${currentServerPort} in ${currentServerMode} mode.`);
  // Removed commented-out process.setuid/setgid
});