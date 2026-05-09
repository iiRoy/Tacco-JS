// This file orchestrates the core components of the data access layer.
// It sets up the web server and manages application configuration.

const fileSys = require("fs"); // File system utility
const pathUtil = require("path"); // Path utility for handling file paths
const mongoDbDriver = require("mongodb"); // MongoDB database driver (though not directly used in this snippet, it's part of the original context)
const webServerLib = module.exports.webFramework = require("restify"); // Web server framework

// --- Application Configuration Management ---

// Default application settings. These can be overridden by a configuration file.
let appSettings = {
  "database": {
    "connectionPort": 27017,
    "hostAddress": "localhost"
  },
  "apiServer": {
    "listenPort": 3500,
    "bindAddress": "0.0.0.0"
  },
  "dataStoreType": "mongodb", // Indicates the type of backend data store
  "enableVerboseLogging": false // Flag to control detailed logging
};

const consoleLogPrefix = "[APP_LOG]: "; // Prefix for console log messages

/**
 * Custom logging utility. Outputs messages to console if verbose logging is enabled.
 * @param {string} message - The message to be logged.
 */
const logToConsole = module.exports.logger = function (message) {
  if (appSettings.enableVerboseLogging) {
    console.log(`${consoleLogPrefix} ${new Date().toISOString()} - ${message}`);
  }
};

/**
 * Loads application settings from a JSON file and merges them with default settings.
 * @param {string} configFilePath - The path to the configuration file.
 * @returns {object} The merged application settings.
 */
const loadConfiguration = (configFilePath) => {
  let loadedConfig = {};
  try {
    const configContent = fileSys.readFileSync(configFilePath, "utf8");
    loadedConfig = JSON.parse(configContent);
    logToConsole(`Configuration loaded successfully from: ${configFilePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') { // File not found
      logToConsole(`Configuration file not found at '${configFilePath}'. Falling back to default settings.`);
    } else { // Other parsing errors
      logToConsole(`Error parsing configuration file '${configFilePath}': ${err.message}. Using default settings.`);
    }
  }
  // Merge loaded configuration with default settings. Deep merge might be better, but for simplicity, shallow merge.
  return {
    ...appSettings,
    ...loadedConfig,
    database: { ...appSettings.database, ...(loadedConfig.database || {}) },
    apiServer: { ...appSettings.apiServer, ...(loadedConfig.apiServer || {}) }
  };
};

// Attempt to load configuration from a file named 'app_config.json' in the current working directory.
const userConfigFile = pathUtil.join(process.cwd(), "app_config.json");
appSettings = loadConfiguration(userConfigFile);

module.exports.applicationConfig = appSettings; // Expose the final application settings

// --- Web Server Initialization ---

const httpApp = webServerLib.createServer({
  name: "dataServiceAPI", // Name of the RESTful API service
  version: '1.0.0' // API version, added for clarity
});

// Define acceptable content types for incoming requests.
const permittedContentTypes = ['application/json', 'text/plain'];

// Apply essential middleware for the web server.
httpApp.use(webServerLib.plugins.acceptParser(permittedContentTypes)); // Parse Accept header
httpApp.use(webServerLib.plugins.bodyParser({ mapParams: false })); // Parse request body, don't map to req.params by default
httpApp.use(webServerLib.plugins.fullResponse()); // Enable full response capabilities (e.g., CORS, content-type)
httpApp.use(webServerLib.plugins.queryParser({ mapParams: false })); // Parse query string parameters

// Optional: Add a custom error handler for the server.
httpApp.on('restifyError', (req, res, err, callback) => {
  logToConsole(`API Error: ${err.message} for ${req.method} ${req.url}`);
  return callback(); // Continue with default error handling
});

module.exports.apiServerInstance = httpApp; // Expose the configured HTTP server instance

// --- Route Loading and Server Start ---

// Dynamically load API routes from a dedicated module.
// This separates routing logic from server setup.
require('./lib/api_routes');

// Guard clause: Ensure the port is a valid number before attempting to listen.
const serverPort = appSettings.apiServer.listenPort;
const serverAddress = appSettings.apiServer.bindAddress;

if (typeof serverPort !== 'number' || serverPort <= 0 || serverPort > 65535) {
  logToConsole(`Invalid server port: ${serverPort}. Server cannot start.`);
  process.exit(1); // Exit if critical configuration is bad
}

// Start the HTTP server and listen for incoming requests.
httpApp.listen(serverPort, serverAddress, function () {
  console.log(`API service '${httpApp.name}' (v${httpApp.version}) now operational at ${httpApp.url}`);
  logToConsole(`Server listening on ${serverAddress}:${serverPort}`);
});

// End of file.