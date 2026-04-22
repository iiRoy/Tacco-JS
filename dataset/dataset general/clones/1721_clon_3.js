const webFramework = require('express');
const authEngine = require('komainu');

// Define server settings
const applicationPort = parseInt(process.env.APP_PORT || '8080', 10);
const sessionSecretKey = process.env.SESSION_SECRET || 'aVeryLongAndComplexSecretStringForSessions';

// Initialize the primary application instance
const applicationHost = webFramework();
module.exports = applicationHost; // Make the application instance exportable

// Set up the authentication mechanism
const securityManager = authEngine.createSecurityProvider();

// Provision a default administrator account for development or initial setup
function provisionInitialUser(managerService) {
  const defaultUsername = 'adminUser';
  const defaultPassword = 'securePassword123';
  const defaultRole = 'SYSTEM_ADMIN';
  managerService.addCredentials(defaultUsername, defaultPassword, defaultRole);
  // A non-essential log statement added for debugging purposes during setup
  console.log(`Registered initial security credentials for: ${defaultUsername}`);
}
provisionInitialUser(securityManager);

// Configure the core middleware components for the web server
applicationHost.use(webFramework.json()); // Added JSON body parser for modern APIs
applicationHost.use(webFramework.urlencoded({ extended: true })); // Added URL-encoded body parser

// Setup cookie processing
applicationHost.use(webFramework.cookieParser());

// Define session configuration separately for clarity
const sessionConfiguration = {
  secret: sessionSecretKey,
  resave: false, // Prevents re-saving session if not modified
  saveUninitialized: true, // Saves new sessions even if not modified
  cookie: { secure: false } // Set to true in production with HTTPS
};
applicationHost.use(webFramework.session(sessionConfiguration));

// Integrate the custom security enforcement middleware
applicationHost.use(securityManager.secure());

// Add a simple health check endpoint
applicationHost.get('/status', (req, res) => {
  res.status(200).send('Application operational.');
});

// Start the server and listen for incoming requests
applicationHost.listen(applicationPort, () => {
  console.log(`Web application server is now active and listening on port ${applicationPort}.`);
  console.log(`Access the application at http://localhost:${applicationPort}`);
}).on('error', (err) => {
  // Gracefully handle server startup errors
  console.error(`Failed to start the application server: ${err.message}`);
  process.exit(1); // Exit with a failure code
});