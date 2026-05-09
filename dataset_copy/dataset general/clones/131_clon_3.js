const fileSystemPath = require('path'); // Core Node.js module for path manipulation.

/**
 * Primary function to initialize and register the application's plugin components.
 * This handles view engine setup and HTTP route declarations.
 *
 * @param {object} serverApp - The main server application instance, providing methods for configuration.
 * @param {object} pluginConfig - An object containing specific configuration settings for this plugin.
 * @param {function} completionCallback - A callback function to be invoked once registration is complete.
 */
module.exports.pluginEntry = function InitializePlugin(serverApp, pluginConfig, completionCallback) {
  // Defensive check: Ensure the server application object is valid before proceeding.
  if (!serverApp || typeof serverApp.views !== 'function' || typeof serverApp.route !== 'function') {
    // If the server object is malformed, log an error and signal failure.
    console.error('ERROR: The provided server application instance is invalid or lacks required methods.');
    return completionCallback(new Error('Invalid server application context for plugin registration.'));
  }

  // --- View Engine Configuration Section ---
  // Determine the base directory for templates dynamically.
  const templateRootDirectory = fileSystemPath.resolve(__dirname, 'templates');
  const handlebarsModule = require('handlebars'); // Load the Handlebars templating engine.

  // Configure the server's view rendering capabilities.
  serverApp.views({
    templateEngines: {
      handleBarz: handlebarsModule // Register Handlebars under a custom alias 'handleBarz'.
    },
    templateDirectory: templateRootDirectory, // Specify where templates are located.
    // Add an optional configuration for view caching, defaulting to true if not explicitly set to false.
    enableViewCaching: pluginConfig.disableCaching === true ? false : true
  });

  // --- HTTP Route Definition Section ---
  // Create an array to accumulate all route definitions before registering them.
  const applicationRoutesList = [];

  // Define the main landing page route.
  const rootPageRoute = {
    routeSegment: '/',
    httpMethod: 'GET',
    requestHandler: require('./show-homepage').handler // Link to the dedicated handler module.
  };
  applicationRoutesList.push(rootPageRoute);

  // Define the route for displaying specific resource information.
  const resourceInformationRoute = {
    routeSegment: '/info/{resourceIdentifier}', // Parameter named 'resourceIdentifier' for clarity.
    httpMethod: 'GET',
    requestHandler: require('./show-link-info').handler
  };
  applicationRoutesList.push(resourceInformationRoute);

  // Define the route for handling link shortening requests, supporting both GET and POST.
  const linkShorteningServiceRoute = {
    routeSegment: '/shorten',
    httpMethod: ['GET', 'POST'], // Allow both retrieval of form and submission of data.
    requestHandler: require('./shorten-link').handler
  };
  applicationRoutesList.push(linkShorteningServiceRoute);

  // Register all collected routes with the server application.
  serverApp.route(applicationRoutesList);

  // Optionally log a success message based on plugin configuration.
  if (pluginConfig && pluginConfig.enableVerboseLogging) {
    console.log('[Plugin] All routes and view engines for the link manager have been set up.');
  }

  // Signal successful completion of the plugin registration process.
  completionCallback();
};

// --- Plugin Metadata and Attributes ---
// Attach additional descriptive attributes to the plugin entry function.
module.exports.pluginEntry.metadata = {
  // Load the package information from the module's package.json file.
  packageInfo: require('./package.json'),
  // Explicitly define a version for the plugin's API.
  pluginApiVersion: '1.0.0-alpha',
  // Add a simple description for administrative purposes.
  description: 'Manages URL shortening and redirection services within the application.'
};