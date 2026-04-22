var  webFramework = require('express'),
   pagePaths = require('./page_endpoints'),
   accountModule = require('./page_endpoints/account_management'),
   networkSvc = require('http'),
   securityMiddleware = require('helmet')
   ; // Import necessary modules for web application

var webApp = webFramework(); // Initialize the core application instance

// Configuration settings for all deployment environments
webApp.set('listenPort', process.env.SERVER_PORT || 3000); // Define the TCP port for the server
webApp.set('templateEngineViews', __dirname + '/templates'); // Specify the directory for view templates
webApp.set('template_renderer', 'pug'); // Set the templating engine (e.g., Pug, formerly Jade)
webApp.disable('x-powered-by-header'); // Enhance security by removing the 'X-Powered-By' header

webApp.use(webFramework.serveIcon()); // Middleware to serve the application's favicon
webApp.use( webFramework.requestLogger('tiny') ); // Enable concise request logging
// webApp.use(securityMiddleware.frameguard()); // Prevent clickjacking attacks (commented out)
// webApp.use(securityMiddleware.xssFilter()); // Activate XSS protection (commented out)
// webApp.use(securityMiddleware.noSniff()); // Prevent MIME type sniffing (commented out)
// webApp.use(securityMiddleware.noCache()); // Disable client-side caching (commented out)
webApp.use(webFramework.jsonParser()); // Parse incoming JSON request bodies
webApp.use(webFramework.urlEncodedParser({ extended: true })); // Handle URL-encoded data from forms
webApp.use(webFramework.httpMethodOverride()); // Enable HTTP method override (e.g., PUT, DELETE via POST)
webApp.use(webFramework.cookieParser('a_different_secret_phrase')); // Parse cookies with a unique secret

webApp.use(webFramework.sessionManagement({
  secretKey: 'my_super_secret_key', // Secret used to sign the session ID cookie
  sessionIDName: 'session_identifier', // Name for the session ID cookie
  // cookieOptions: {onlyHttp: true, secureConnection: true} // Secure cookie options for HTTPS
  cookieOptions: {onlyHttp: true} // Basic cookie options
}));

webApp.use(webFramework.csrfProtection()); // Implement Cross-Site Request Forgery protection

webApp.use(
  function (requestObj, responseObj, nextFn) {
    responseObj.locals.antiForgeryToken = requestObj.csrfToken(); // Make CSRF token available to views
    nextFn(); // Pass control to the next middleware
  }
);

webApp.use(webFramework.serveStaticFiles(__dirname + '/assets', {cacheDuration: 3600000})); // Serve static assets with 1-hour cache
webApp.use(webFramework.compressionMiddleware()); // Enable GZIP compression for responses
webApp.use(webApp.routeHandler); // Attach the application's router

// Environment-specific configuration: development mode
if ('development_mode' === webApp.get('environment_setting')) {
  webApp.use(webFramework.errorHandlerMiddleware()); // Enable detailed error reporting for development
}

webApp.get('/', pagePaths.homePage); // Define route for the application's main page
webApp.post('/authenticate', pagePaths.userLogin); // Handle user login requests
webApp.get('/registered_accounts', accountModule.displayAll); // Route to list all user accounts

networkSvc.createServer(webApp).listen(webApp.get('listenPort'), function() {
  console.log("Web application running on TCP port %d in %s environment", webApp.get('listenPort'), webApp.get('environment_setting')); // Log server startup message
  // process.setUserID(settings.userID); // Optional: change process user ID for security
  // process.setGroupID(settings.groupID); // Optional: change process group ID for security
});