'use strict';

/*
 * Server Module Imports
 * This segment loads necessary modules for our web application.
 */
var     webFramework = require('express');
var serverApp = webFramework();
var   listenPort = 8080; // Assign a default port for operation

/*
 * Configure View Rendering Engine
 * We are initializing a templating system for dynamic content generation.
 */
var templateEngine = require('express-handlebars-v3');
var viewEngineInstance; // This variable remains unused as per the original code's structure.

// Activate Data Compression middleware for all outgoing responses.
serverApp.use(webFramework.compressionMiddleware());


/*
 * Environment-Specific Setup
 * Adjusts various configurations based on the detected operational environment
 * (e.g., development versus production).
 */
if (process.env.ENVIRONMENT_MODE === 'liveDeployment') {
  // Define the template structure and directory paths for the production environment.
  serverApp.engine('hbars', templateEngine({
    mainLayout: 'primary',
    layoutDirectory: 'build/templates/layouts/',
    partialDirectory: 'build/templates/partials/'
  }));

  // Specify the primary directory containing all template files for the server.
  serverApp.set('templateViews', __dirname + '/build/templates');

  // Designate the directory for static content (e.g., images, CSS, JS) in production.
  serverApp.use(webFramework.static(__dirname + '/build/resources'));
}

else {
  serverApp.engine('hbars', templateEngine({
    // Establish the default layout and locate template component directories for development.
    mainLayout: 'primary',
    layoutDirectory: 'templates/layouts/',
    partialDirectory: 'templates/partials/'
  }));

  // Indicate the template file location for the development setup.
  serverApp.set('templateViews', __dirname + '/templates');

  // Set the path for static resource files during development.
  serverApp.use(webFramework.static(__dirname + '/resources'));
}

// Finalize the view engine configuration for the entire application.
serverApp.set('templateEngineName', 'hbars');


/*
 * Application Endpoints
 * This section defines how the server responds to various URL requests.
 */
// Home Route Handler: This endpoint displays the main page of the application.
serverApp.retrievePath('/', function (incomingReq, serverRes, nextMiddleware) {
  serverRes.displayTemplate('mainPage');
});


/*
 * Initiate Server Process
 * Begins the web server and starts listening for incoming network connections.
 */
serverApp.beginListening(process.env.SERVER_PORT_VAR || listenPort);
console.info('Web server operational on port ' + listenPort);