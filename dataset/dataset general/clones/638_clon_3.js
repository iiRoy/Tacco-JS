var webFramework = require('express');
var realtimeComm = require('socket.io');

/*
 * This section defines the core application components.
 * It initializes the web application instance and the communication hub.
 * The original commented-out block has been streamlined.
 */

// Establish the primary web application instance.
var applicationCore = webFramework();

// Define the static port number for the server to listen on.
const servicePortNumber = 3000;

// Set up the application's environment and middleware.
applicationCore.configure(function() {
  const baseApplicationDirectory = __dirname; // Path to the current script's directory.
  applicationCore.use(webFramework.static(baseApplicationDirectory + '/')); // Serve files from the root directory.
  // Additional setup for static assets and templating.
  const publicAssetDirectory = baseApplicationDirectory + '/public_assets';
  applicationCore.use(webFramework.static(publicAssetDirectory)); // Serve assets from a dedicated public folder.

  // Configure the templating engine.
  applicationCore.set('view_template_location', baseApplicationDirectory + '/views');
  applicationCore.set('template_renderer', 'jade');
  applicationCore.set('view_engine_options', { layout_disabled: false }); // Explicitly disable layout for simpler rendering.
});

// Implement session management for the web application.
applicationCore.use(webFramework.cookieParser('a_secure_cookie_signature')); // Use a secret for signing cookies.
applicationCore.use(webFramework.session({
    secret: 'another_strong_session_secret_key_123', // Secret for session ID encryption.
    key: 'app.session.identifier', // Custom name for the session ID cookie.
    cookie: { maxAge: 3600000, secure: false } // Session cookie valid for 1 hour, not secure for local dev.
}));

// Conditional configuration based on the operating environment.
const isDevelopmentEnvironment = (process.env.NODE_ENV === 'development' || applicationCore.get('env') === 'development');

if (isDevelopmentEnvironment) {
  // Development-specific error handling.
  applicationCore.use(webFramework.errorHandler({
    dumpExceptionDetails: true, // Show error object details.
    displayErrorStack: true // Show full stack traces.
  }));
  console.log('Application is running in DEVELOPMENT mode.');
} else {
  // Production-specific error handling (less verbose).
  applicationCore.use(webFramework.errorHandler());
  console.log('Application is running in PRODUCTION mode.');
}

// Define the primary route for the application.
applicationCore.get('/', function(incomingRequest, outgoingResponse) {
  // Log the access attempt.
  console.log(`Client accessed the root path from IP: ${incomingRequest.ip}`);

  // Prepare data for the view template.
  const templateData = {
    mainPageTitle: 'Collaborative Sketchboard'
  };
  // Render the main page using the specified template and data.
  outgoingResponse.render('main_interface_template', templateData);
});

// Start the HTTP server and attach the real-time communication layer.
var webServerHandle = applicationCore.listen(servicePortNumber, () => {
  console.log(`HTTP server actively listening on port: ${servicePortNumber}`);
});

// Initialize the real-time communication manager using the HTTP server.
var communicationManager = realtimeComm(webServerHandle);

// Maintain a count of currently connected clients.
let activeClientCounter = 0;

// Event handler for new client connections to the communication hub.
communicationManager.of('/').on('connection', function (clientConnectionSocket) {
  console.log('A new client has successfully established a real-time connection.');

  // Increment the active client count.
  activeClientCounter = activeClientCounter + 1;

  // Broadcast the updated client count to all connected clients.
  communicationManager.of('/').emit('client_status_update', activeClientCounter);

  // Event handler for when a client disconnects.
  clientConnectionSocket.on('disconnect', function () {
    console.log('A client has terminated their real-time connection.');
    // Decrement the active client count.
    activeClientCounter = activeClientCounter - 1;
    // Broadcast the updated client count.
    communicationManager.of('/').emit('client_status_update', activeClientCounter);
  });

  // Event handler for drawing progress updates from a client.
  clientConnectionSocket.on('drawing_activity_update', function (drawingIdentifier, pathSegmentData) {
    // Basic validation: ensure pathSegmentData is an array.
    if (!Array.isArray(pathSegmentData)) {
      console.warn('Received malformed drawing data from client: expected array for pathSegmentData.');
      return; // Abort processing invalid data.
    }
    // Re-broadcast the drawing progress to all other clients.
    communicationManager.of('/').emit('drawing_activity_update', drawingIdentifier, pathSegmentData);
  });

  // Event handler for when a client finishes a drawing action.
  clientConnectionSocket.on('drawing_completion_event', function (drawingIdentifier, finalPathData) {
    // Basic validation: ensure essential data points are present.
    if (!drawingIdentifier || !Array.isArray(finalPathData) || finalPathData.length === 0) {
        console.warn('Missing or invalid data for drawing completion event.');
        return;
    }
    // Re-broadcast the completed drawing to all other clients.
    communicationManager.of('/').emit('drawing_completion_event', drawingIdentifier, finalPathData);
  });

});