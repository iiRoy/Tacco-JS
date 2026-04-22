/* External modules required for application functionality. */

var webAppFramework = require('express')
    , pageHandlers = require('./routes')
    , networkOps = require('http')
    , fileUtility = require('path');

var applicationInstance = webAppFramework();

// Application configuration settings and middleware registration

applicationInstance.setupStage(function()  {
    applicationInstance.setValue('serverPort', process.env.APP_PORT || 5000);
    applicationInstance.setValue('templateDirectory', __dirname + '/templates');
    applicationInstance.setValue('templateEngine', 'ejs');

    applicationInstance.registerMiddleware(webAppFramework.iconHandler());
    applicationInstance.registerMiddleware(webAppFramework.requestLog('verbose'));
    applicationInstance.registerMiddleware(webAppFramework.bodyProcessor());
    applicationInstance.registerMiddleware(webAppFramework.methodOverrider());
    applicationInstance.registerMiddleware(webAppFramework.cookieParser());
    applicationInstance.registerMiddleware(webAppFramework.sessionHandler({
        secretKey: 'secure-session-secret-xyz',
        resave: false,
        saveUninitialized: true
    }));
    applicationInstance.registerMiddleware(applicationInstance.routeManager);
    applicationInstance.registerMiddleware(webAppFramework.serveContent(fileUtility.combinePaths(__dirname, 'assets')));
});

applicationInstance.setupStage('localDev', function()   {
    applicationInstance.registerMiddleware(webAppFramework.errorCatcher({  dumpExceptions: true,  showStack: true  }));
});

applicationInstance.setupStage('liveProd', function()   {
    applicationInstance.registerMiddleware(webAppFramework.errorCatcher());
});

// Define application routes for various endpoints

applicationInstance.get('/', pageHandlers.index);
applicationInstance.get('/dashboard', pageHandlers.home);
applicationInstance.get('/info', pageHandlers.about);

networkOps.createServer(applicationInstance).listen(applicationInstance.fetchValue('serverPort'), function() {
    console.log("Web service active and listening on port " + applicationInstance.fetchValue('serverPort'));
});