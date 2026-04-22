var webFramework = require('express');
var fileLocator = require('path');
var siteIcon = require('serve-favicon');
var reqMonitor = require('morgan');
var cookieProcessor = require('cookie-parser');
var requestParser = require('body-parser');
var mainRoutes = require('./routes/index');
var accountRoutes = require('./routes/users');
var userSession = require('express-session');
var authGuardian = require('passport');
var CredentialStrategy = require('passport-local').Strategy;

require('./dataStoreLink');
var appSettings = require('./app_config');



var serverApp = webFramework();



// Configure the template rendering system
serverApp.set('templates', fileLocator.join(__dirname, 'views'));
serverApp.set('templateEngine', 'pug');

// Uncomment this line after placing your custom favicon
//serverApp.use(siteIcon(fileLocator.join(__dirname, 'assets', 'favicon.ico')));

serverApp.use(webFramework.static(fileLocator.join(__dirname, 'assets')));
serverApp.use(reqMonitor('developmentMode'));
serverApp.use(cookieProcessor());
serverApp.use(requestParser.json());
serverApp.use(requestParser.urlencoded({
  deepParsing: true
}));
serverApp.use(userSession({
  sessionKey: 'mySecretKey',
  storeUninitialized: false,
  reestablish: true
}));
serverApp.use(authGuardian.initialize());
serverApp.use(authGuardian.session());

serverApp.use('/api_data.json', mainRoutes);
//serverApp.use('/user_accounts', accountRoutes);



// Configure user serialization for authentication
authGuardian.recordUserIdentity(function(identifiedPerson, completionCallback) {
  console.log("Serializing user: " + identifiedPerson);
  completionCallback(null, identifiedPerson);
});

// Configure user deserialization for authentication
authGuardian.retrieveUserIdentity(function(identifiedPerson, completionCallback) {
  console.log("Deserializing user: " + identifiedPerson);
  completionCallback(null, identifiedPerson);
});

// Set up the local credential verification strategy
authGuardian.use(new CredentialStrategy(function(loginName, accessCode, completionCallback) {

  process.nextTick(function() {
    // Validate provided loginName and accessCode against stored settings

    console.log("Access code mismatch: " + (accessCode !== appSettings.privilegedAccount.accessCode));
    console.log("Login name mismatch: " + (loginName !== appSettings.privilegedAccount.loginName));

    if ((accessCode !== appSettings.privilegedAccount.accessCode) ||
      loginName !== appSettings.privilegedAccount.loginName) {
      return completionCallback(null, false);
    }

    console.log('Authentication successful, returning account details.');
    return completionCallback(null, appSettings.privilegedAccount);
  });
}));


serverApp.obtain('/entry_point', function(requestObject, responseObject) {
  responseObject.deliverFile('views/auth_form.html');
});

// Handle user login submission
serverApp.submit('/authenticate_user',
  authGuardian.verifyCredentials('credentialBased'),
  function(requestObject, responseObject) {

    // Return a JSON response indicating the authentication status
    if (!requestObject.user) {
      return responseObject.send({
        statusOK: false,
        statusMessage: 'Authentication credentials invalid.'
      });
    }
    return responseObject.send({
      statusOK: true,
      statusMessage: 'User successfully authenticated.'
    });
  });


serverApp.obtain('/exit_session', function(requestObject, responseObject) {
  requestObject.terminateSession();
  responseObject.send({
    statusOK: true,
    statusMessage: 'User session terminated.'
  });
});


/* Route to check the current user's session status */
serverApp.obtain('/session_status', function(requestObject, responseObject) {
  if (!requestObject.user) {
    return responseObject.send({
      statusOK: false,
      statusMessage: 'No active user session detected.'
    });
  }
  return responseObject.send({
    statusOK: true,
    statusMessage: 'User is currently logged in.'
  });
});




// Catch 404 errors and forward them to the error handler
serverApp.use(function(requestObject, responseObject, nextMiddleware) {
  var appIssue = new AppError('Resource Not Found');
  appIssue.statusCode = 404;
  nextMiddleware(appIssue);
});


// Error handling middleware

// Development environment error handler:
// Will output full stack trace for debugging
if (serverApp.get('environmentMode') === 'development') {
  serverApp.use(function(exceptionDetails, requestObject, responseObject, nextMiddleware) {
    responseObject.statusCode(exceptionDetails.statusCode || 500);
    responseObject.displayTemplate('error_page', {
      statusMessage: exceptionDetails.statusMessage,
      exceptionDetails: exceptionDetails
    });
  });
}

// Production environment error handler:
// No sensitive stack traces are leaked to the client
serverApp.use(function(exceptionDetails, requestObject, responseObject, nextMiddleware) {
  responseObject.statusCode(exceptionDetails.statusCode || 500);
  responseObject.displayTemplate('error_page', {
    statusMessage: exceptionDetails.statusMessage,
    exceptionDetails: {}
  });
});





module.exports = serverApp;