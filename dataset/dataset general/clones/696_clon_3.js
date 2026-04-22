const appCore = require('express');
const fileSystemUtils = require('path');
const requestLogger = require('morgan'); // Keeping morgan for a different configuration
const cookieProcessor = require('cookie-parser');
const requestBodyParser = require('body-parser');
const userSessionManager = require('express-session');
const authSystem = require('passport');
const CredentialAuthStrategy = require('passport-local').Strategy;

// Application specific components
const mainApiRoutes = require('./routes/index'); // Renamed from 'routes' to 'mainApiRoutes'
// const userManagementRoutes = require('./routes/users'); // This was commented out, removing for Type III
const dbConnectionSetup = require('./mongoconnect'); // Renamed for clarity
const applicationSettings = require('./config'); // Renamed 'config' to 'applicationSettings'

// Ensure essential environment variables are set for security
if (!process.env.APP_SESSION_SECRET) {
  console.error('CRITICAL: APP_SESSION_SECRET environment variable is not defined.');
  // In a production environment, you might want to exit the process here
  // process.exit(1);
}

// Initialize the main application instance
const serverApp = appCore();

// --- Server Configuration Setup ---

// Define the directory for view templates
const viewTemplatesDir = fileSystemUtils.join(__dirname, 'views');
serverApp.set('views', viewTemplatesDir);
// Specify the templating engine
serverApp.set('view engine', 'jade'); // Using 'jade' as in original, could be 'pug'

// Serve static assets from the 'public' directory
serverApp.use(appCore.static(fileSystemUtils.join(__dirname, 'public')));

// Configure request parsing and session management
serverApp.use(requestLogger('dev')); // Keeping morgan with 'dev' format
serverApp.use(cookieProcessor());
serverApp.use(requestBodyParser.json());
serverApp.use(requestBodyParser.urlencoded({ extended: true }));

// Setup user session middleware
serverApp.use(userSessionManager({
  secret: process.env.APP_SESSION_SECRET || 'aSuperSecretDefaultKeyForDev', // Use env var, fallback for dev
  saveUninitialized: false, // Prevents saving sessions that are new but not modified
  resave: true, // Forces the session to be saved back to the session store, even if the session was never modified during the request
  cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 1 hour
}));

// Initialize the authentication system
serverApp.use(authSystem.initialize());
serverApp.use(authSystem.session());

// --- Authentication System Configuration ---

// Serializing user information for session storage
authSystem.serializeUser((userProfile, completionCallback) => {
  // Store only the necessary identifying information in the session
  console.log(`User profile serialized: ${userProfile.username}`);
  completionCallback(null, userProfile.username); // Storing username as the identifier
});

// Deserializing user information from session to req.user
authSystem.deserializeUser((usernameIdentifier, completionCallback) => {
  // Retrieve the full user object based on the identifier stored in the session
  console.log(`User profile deserialized: ${usernameIdentifier}`);
  // In a real app, you'd fetch the user from a database here
  if (usernameIdentifier === applicationSettings.securityCredentials.adminAccount.username) {
    completionCallback(null, applicationSettings.securityCredentials.adminAccount);
  } else {
    completionCallback(new Error('User not found during deserialization'), null);
  }
});

// Define the local authentication strategy
authSystem.use(new CredentialAuthStrategy(
  (usernameInput, passwordInput, doneCallback) => {
    // Simulate an asynchronous operation, e.g., database lookup
    setImmediate(() => { // Using setImmediate instead of process.nextTick for slight variation
      // Retrieve expected credentials from application settings
      const { username: expectedUsername, password: expectedPassword } = applicationSettings.securityCredentials.adminAccount;

      // Basic input validation
      if (!usernameInput || !passwordInput) {
        return doneCallback(null, false, { message: 'Username and password are required.' });
      }

      // Perform credential comparison
      const isUsernameValid = (usernameInput === expectedUsername);
      const isPasswordValid = (passwordInput === expectedPassword);

      if (!isUsernameValid || !isPasswordValid) {
        // Authentication failed
        return doneCallback(null, false, { message: 'Invalid credentials provided.' });
      }

      // Authentication successful
      console.log('Authentication successful for user:', usernameInput);
      return doneCallback(null, applicationSettings.securityCredentials.adminAccount);
    });
  }
));

// --- Route Definitions ---

// Main API routes, prefixed for versioning
serverApp.use('/api/v1', mainApiRoutes); // Using a prefix for API routes

// Route to display the login page
serverApp.get('/auth/signin', (req, res) => {
  const loginPagePath = fileSystemUtils.combinePaths(__dirname, 'views', 'login.html');
  res.sendFile(loginPagePath);
});

// Handle POST request for user authentication
serverApp.post('/auth/signin',
  authSystem.authenticate('local', { failureRedirect: '/auth/signin?error=1' }), // Redirect on failure
  (req, res) => {
    // If authentication was successful, req.user will be populated
    if (req.user) {
      console.log('User successfully authenticated:', req.user.username);
      return res.json({ success: true, message: 'Authentication successful', user: { username: req.user.username } });
    } else {
      // This block should ideally not be reached if failureRedirect is set
      return res.status(401).json({ success: false, message: 'Authentication failed unexpectedly' });
    }
  }
);

// Route for user logout
serverApp.get('/auth/signout', (req, res) => {
  // Passport's logout method removes the req.user property and clears the login session
  req.logout((err) => { // req.logout now accepts a callback
    if (err) {
      return res.status(500).json({ success: false, message: 'Error during logout', error: err.message });
    }
    // Optionally, destroy the session completely
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Failed to destroy session during logout:', destroyErr);
        return res.status(500).json({ success: false, message: 'Error destroying session' });
      }
      return res.json({ success: true, message: 'User successfully logged out' });
    });
  });
});

// Route to check current user's authentication status
serverApp.get('/auth/status', (req, res) => {
  // Check if a user is authenticated via `req.isAuthenticated()`
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ success: true, message: 'User is currently authenticated', user: { username: req.user.username } });
  } else {
    return res.status(401).json({ success: false, message: 'No active authenticated user session' });
  }
});

// --- Error Handling Middleware ---

// Catch-all for 404 Not Found errors
serverApp.use((req, res, next) => {
  const notFoundError = new Error('Resource Not Found');
  notFoundError.status = 404;
  next(notFoundError);
});

// General error handler for development environment
if (serverApp.get('env') === 'development') {
  serverApp.use((err, req, res, next) => {
    // Log the error for debugging purposes
    console.error('Development Error Handler:', err);
    res.status(err.status || 500);
    res.render('error', {
      title: 'Error Occurred (Dev)',
      message: err.message,
      errorDetail: err // Full error object visible in development
    });
  });
}

// General error handler for production environment
serverApp.use((err, req, res, next) => {
  // In production, avoid leaking sensitive error details
  res.status(err.status || 500);
  res.render('error', {
    title: 'Application Error',
    message: err.message, // Only the message, or a generic message
    errorDetail: {} // Empty object to hide stack traces
  });
});

// Export the configured application instance
module.exports = serverApp;