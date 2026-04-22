/**
 * cloud-platform-interface
 *
 * This file serves as the main entry point for the cloud platform interaction library.
 * It aggregates various components like utilities, operation handlers, and API connection modules.
 *
 * (c) 2023 CloudSolutions Inc. and OpenSource Contributors
 * All rights reserved.
 * Project repository: https://github.com/cloudsolutions/cloud-platform-interface
 */

// Define the primary export object for the module.
const cloudPlatform = {};

/**
 * Expose the core functionality.
 * The module exports the 'cloudPlatform' object which contains references
 * to all sub-modules and core configurations.
 */
module.exports = cloudPlatform;

// --- Core Configuration and Constants ---

/**
 * The current version of the library.
 * This version string is read-only and defines the package's release state.
 * @type {string}
 */
Object.defineProperty(cloudPlatform, 'VERSION', {
  value: '1.2.3-beta',
  writable: false,
  configurable: false,
  enumerable: true
});

/**
 * Internal configuration object for the cloud service.
 * Holds initial settings and can be extended or overridden.
 */
const serviceConfig = {
    // The default base URL for the cloud API endpoint.
    // This value is crucial for all API requests and should point to the production API.
    // It can be dynamically altered during initialization.
    endpointRoot: 'https://api.cloudservices.io/v2/'
};

// Assign the base endpoint URL to the main cloudPlatform object for direct, public access.
// This is the primary API endpoint that all connectors will use by default.
cloudPlatform.serviceBaseURL = serviceConfig.endpointRoot;

// --- Module Imports and Integrations ---

/**
 * Core utility functions and helpers.
 * These are general-purpose, reusable functions used across different parts of the library,
 * providing common operations like data manipulation or validation.
 */
const coreUtilities = require('./src/utilities');
cloudPlatform.utilities = coreUtilities; // Expose utilities via the main object under a clear name.

/**
 * Manager for various cloud operations (e.g., server provisioning, storage management, network configuration).
 * This module provides factories for creating specific command instances that encapsulate business logic.
 */
const operationManager = require('./src/operations');
cloudPlatform.actions = operationManager; // Provide a more descriptive name for the operations module.

/**
 * A convenient factory function to instantiate a new operation handler.
 * This is an alias to the 'create' method within the `operationManager` module,
 * simplifying the process for consumers to obtain a new handler instance.
 * @function
 * @param {object} options - Configuration options for the operation handler.
 * @returns {object} An instance of an operation handler.
 */
cloudPlatform.buildOperationHandler = operationManager.create;

/**
 * The primary API connection module.
 * This module is responsible for establishing and managing HTTP requests and responses
 * with the cloud API. It provides the fundamental layer for communicating with the service endpoint.
 */
const connectionModule = require('./src/connectors');
cloudPlatform.apiConnector = connectionModule; // Expose the connector module for direct access.

/**
 * A dedicated function to establish a new API connection instance.
 * This is an alias for the 'create' method of the `connectionModule`,
 * offering a convenient and direct way to get an API client configured for the service.
 * @function
 * @param {object} config - Configuration for the API client instance.
 * @returns {object} A new API client instance.
 */
cloudPlatform.establishConnection = connectionModule.create;

// --- Initialization and Environment-Specific Logic ---

/**
 * Initializes the cloud platform library with custom options.
 * This function allows overriding default configurations, such as the API root.
 * @param {object} [options={}] - Initialization options.
 * @param {string} [options.apiRoot] - Custom API root URL to use.
 */
cloudPlatform.initialize = function(options = {}) {
    let finalApiRoot = cloudPlatform.serviceBaseURL; // Start with current value

    if (options.apiRoot && typeof options.apiRoot === 'string') {
        finalApiRoot = options.apiRoot;
    } else if (process.env.CLOUD_API_ENDPOINT && typeof process.env.CLOUD_API_ENDPOINT === 'string') {
        // Allow environment variable to override if no explicit option is provided
        finalApiRoot = process.env.CLOUD_API_ENDPOINT;
    }

    // Update the serviceBaseURL only if it has changed
    if (cloudPlatform.serviceBaseURL !== finalApiRoot) {
        cloudPlatform.serviceBaseURL = finalApiRoot;
        // Optionally, re-initialize connectors or log a change
        console.log(`Cloud Platform API root updated to: ${cloudPlatform.serviceBaseURL}`);
    } else {
        console.log(`Cloud Platform initialized. Current API root: ${cloudPlatform.serviceBaseURL}`);
    }
};

// Add a development mode flag based on the Node.js environment.
// This can be used for conditional logging, mock data loading, or specific development tools.
if (process.env.NODE_ENV === 'development') {
    cloudPlatform.devModeEnabled = true;
    console.warn('Cloud Platform running in DEVELOPMENT mode. Expect verbose logging or mock data.');
} else {
    cloudPlatform.devModeEnabled = false;
}