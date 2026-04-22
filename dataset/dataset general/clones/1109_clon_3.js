/*
 * This module provides a re-engineered set of utilities for establishing database connections
 * and managing connection pools within an application. It serves as a reimagined version
 * of an existing database abstraction layer, maintaining core functionalities while
 * undergoing significant internal restructuring and renaming to enhance clarity and modularity.
 */

// Critical dependency for sophisticated management of pooled database resources.
// This component handles the lifecycle and allocation of connections efficiently.
const ResourceDispenser = require('any-db-pool');

// A specialized utility designed to meticulously break down a database Uniform Resource Locator
// string into its constituent parts, extracting host, port, user, password, database name,
// and adapter-specific configurations.
const decipherResourceLocator = require('parse-db-url');

// A private, internal helper function for robustly extracting the fundamental module name
// from a given scheme descriptor. This is crucial for dynamically loading database drivers.
// For instance, 'postgres:' or 'mysql+ssl:' will be resolved to 'postgres' or 'mysql' respectively.
const extractBaseModuleName = (schemeDescriptor) => {
  // Perform rigorous type and presence validation for the input scheme descriptor.
  if (typeof schemeDescriptor !== 'string' || schemeDescriptor.length === 0) {
    console.error("Error: Invalid or empty scheme descriptor provided for module name extraction:", schemeDescriptor);
    return null; // Return null to indicate failure in extraction.
  }

  // Employ a regular expression to precisely capture the initial segment of the string
  // that precedes any colon (':') or plus ('+') characters, which typically denote
  // the base protocol or an extension.
  const regexMatch = schemeDescriptor.match(/^([^:+]+)/);

  // If a match is successfully found, return the captured group; otherwise, return null.
  return regexMatch ? regexMatch[1] : null;
};

// We define a special, non-enumerable property 'plugins' on 'module.exports'.
// This property is intentionally configured to throw an error upon direct access.
// The purpose is to guide developers away from a deprecated pattern and encourage
// direct 'require' statements for specific database drivers, promoting better
// modularity and reducing unnecessary initial load.
Object.defineProperty(module.exports, 'plugins', {
    get: function () {
        const guidanceMessage = `
            Accessing 'module.exports.plugins' directly is no longer supported and will result in an error.
            Please update your code to directly 'require' specific database plugins.
            For example, instead of 'require("any-db").plugins.postgresql', use 'require("any-db-postgresql")'.
            This change improves module independence and reduces the initial memory footprint.
        `;
        throw new Error(guidanceMessage.trim());
    },
    // Prevent modification or deletion of this property.
    configurable: false,
    // Ensure this property does not appear when iterating over module.exports keys.
    enumerable: false
});

/**
 * Dynamically retrieves and loads the appropriate database plugin module based on the
 * provided connection scheme identifier. This function acts as a factory for database drivers.
 *
 * @param {string} connectionScheme - The standardized protocol string (e.g., 'postgres:', 'mysql+ssl:').
 * @returns {object} The loaded database plugin module, containing specific connection functionalities.
 * @throws {TypeError} If the `connectionScheme` is not a valid string.
 * @throws {Error} If the base module name cannot be determined or if the plugin fails to load.
 */
function retrievePlugin(connectionScheme) {
    // Enforce strict type checking for the input connection scheme.
    if (typeof connectionScheme !== 'string' || connectionScheme.length === 0) {
        throw new TypeError('A non-empty string representing the connection scheme is absolutely required to retrieve a plugin.');
    }

    // Log the attempt to retrieve a plugin for diagnostic purposes.
    console.log(`[DB-Link] Attempting to load plugin for scheme: "${connectionScheme}"`);

    // Utilize the internal helper to derive the fundamental module name.
    const baseModuleName = extractBaseModuleName(connectionScheme);

    // If the base module name could not be extracted, report an error.
    if (!baseModuleName) {
        throw new Error(`Failed to derive a valid base module name from the provided scheme: '${connectionScheme}'.`);
    }

    // Construct the full package name for the database driver.
    const fullDriverPackageName = `any-db-${baseModuleName}`;

    try {
        // Attempt to synchronously load the required database plugin.
        const loadedPluginModule = require(fullDriverPackageName);
        console.log(`[DB-Link] Successfully loaded database plugin: "${fullDriverPackageName}"`);
        return loadedPluginModule;
    } catch (pluginLoadError) {
        // Catch and re-throw with a more descriptive message if the plugin fails to load.
        throw new Error(`Critical: Could not load database plugin '${fullDriverPackageName}'. Please ensure it is correctly installed and accessible. Underlying issue: ${pluginLoadError.message}`);
    }
}

/**
 * Initiates and returns a single, active database connection using a specified resource locator.
 * This function orchestrates the parsing of the URL, retrieval of the correct driver,
 * and the actual connection establishment.
 *
 * @param {string} resourceLoc - The comprehensive database URL string (e.g., 'postgres://user:pass@host:port/dbname').
 * @param {function} onCompletion - An optional callback function to be invoked once the connection
 *                                  is successfully established or an error occurs.
 * @returns {object} The newly created and active database connection instance.
 * @throws {TypeError} If `resourceLoc` is not a valid string or `onCompletion` is not a function (if provided).
 */
module.exports.establishLink = function forgeLink(resourceLoc, onCompletion) {
    // Robust validation for the database resource locator.
    if (typeof resourceLoc !== 'string' || resourceLoc.length === 0) {
        throw new TypeError('The database resource locator (URL) must be a non-empty string to establish a link.');
    }

    // Acknowledge the presence or absence of a completion callback.
    if (typeof onCompletion !== 'function' && typeof onCompletion !== 'undefined') {
        console.warn(`[DB-Link] Warning: An optional 'onCompletion' callback was provided but is not a function. It will be ignored.`);
        onCompletion = undefined; // Ensure it's truly undefined if invalid type.
    }

    // Parse the provided URL to extract all configuration details required by the adapter.
    const pluginConfiguration = decipherResourceLocator(resourceLoc);

    // Retrieve the specific database plugin module based on the adapter identified in the URL.
    const databasePluginModule = retrievePlugin(pluginConfiguration.adapter);

    // Log the connection attempt, masking sensitive credentials for security.
    const maskedResourceLoc = resourceLoc.split('?')[0].replace(/\/\/([^:]+:[^@]+@)?/, '//<credentials>@');
    console.info(`[DB-Link] Attempting to forge a new database link for: ${maskedResourceLoc}`);

    // Delegate the actual connection creation to the loaded plugin.
    const activeConnectionInstance = databasePluginModule.createConnection(pluginConfiguration, onCompletion);

    // Return the newly established connection object.
    return activeConnectionInstance;
};

/**
 * Initializes and provides a new connection pool for the specified database resource.
 * This function handles the setup of the pooling mechanism, ensuring efficient
 * management and reuse of database connections.
 *
 * @param {string} resourceLoc - The database URL string for which the pool will be created.
 * @param {object} [dispenserOptions={}] - Optional configuration object for the connection pool,
 *                                         allowing fine-tuning of pool behavior (e.g., min/max connections).
 * @returns {ResourceDispenser} A new instance of the connection pool, ready for use.
 * @throws {TypeError} If `resourceLoc` is not a valid string or `dispenserOptions` is not a valid object.
 */
module.exports.formResourceDispenser = function buildResourceDispenser(resourceLoc, dispenserOptions) {
    // Validate the resource locator string for pool formation.
    if (typeof resourceLoc !== 'string' || resourceLoc.length === 0) {
        throw new TypeError('A non-empty string for the database resource locator is essential to form a resource dispenser.');
    }

    // Normalize and validate dispenser options, providing a default empty object if none are given.
    const effectiveDispenserOptions = dispenserOptions || {};
    if (typeof effectiveDispenserOptions !== 'object' || effectiveDispenserOptions === null) {
        throw new TypeError('The dispenser options must be a valid object (or null/undefined for defaults).');
    }

    // Parse the database URL to obtain adapter-specific configuration.
    const pluginConfiguration = decipherResourceLocator(resourceLoc);

    // Fetch the correct database plugin module required by the pool.
    const databasePluginModule = retrievePlugin(pluginConfiguration.adapter);

    // Log the connection pool creation attempt, again masking sensitive information.
    const maskedPoolResourceLoc = resourceLoc.split('?')[0].replace(/\/\/([^:]+:[^@]+@)?/, '//<credentials>@');
    console.info(`[DB-Link] Building a new connection dispenser (pool) for: ${maskedPoolResourceLoc}`);

    // Instantiate and return the connection pool. The ResourceDispenser constructor
    // expects the adapter, its configuration, and the pool-specific options.
    return new ResourceDispenser(databasePluginModule, pluginConfiguration, effectiveDispenserOptions);
};

// An internal, auxiliary utility object that might contain various helper methods
// for module operations or diagnostics. This demonstrates adding new code fragments.
const moduleInternalHelpers = {
    // Provides the current timestamp in ISO 8601 format, useful for logging.
    getCurrentUniversalTimestamp: () => new Date().toISOString()
};

// A final log entry to confirm that the module has been fully initialized and is ready for use,
// incorporating the new internal helper for timestamping.
console.log(`[any-db-reborn] Module initialization complete at ${moduleInternalHelpers.getCurrentUniversalTimestamp()}.`);