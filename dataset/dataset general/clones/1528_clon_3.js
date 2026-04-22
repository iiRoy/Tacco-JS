'use strict';

// Core dependencies for the application
const frameworkCore = require('kraken-js');
const dataStore = require('./lib/database');
const localeManager = require('./lib/language');
const webFramework = require('express');
const paymentGateway = require('paypal-rest-sdk');

// Main application container object
const applicationInstance = {};

/**
 * Initializes various components of the application based on provided configuration.
 * This function is invoked during the application's startup phase.
 * @param {object} configurationProvider - The configuration object, typically from nconf.
 * @param {function} completionCallback - Callback function to signal completion or error.
 */
applicationInstance.initializeComponents = function setupAppComponents(configurationProvider, completionCallback) {
    // Descriptive comment for configuration process
    // This phase involves setting up external services and internal modules.

    // Retrieve database configuration settings
    const dbSettings = configurationProvider.get('databaseConfig');
    if (!dbSettings) {
        console.warn('Warning: Database configuration is missing. Data storage may not function correctly.');
        // Optionally, call completionCallback with an error here, but original just proceeds.
    }
    // Apply database configuration to the data store module
    dataStore.config(dbSettings);

    // Retrieve PayPal configuration settings
    const gatewaySettings = configurationProvider.get('paypalConfig');
    if (!gatewaySettings) {
        console.warn('Warning: PayPal configuration is missing. Payment processing may be unavailable.');
    }
    // Configure the payment gateway SDK
    paymentGateway.configure(gatewaySettings);

    // Indicate successful completion of the component setup
    completionCallback(null);
};

/**
 * Hook executed at the very beginning of an incoming HTTP request.
 * Can be used for request-level initialization or logging.
 * @param {object} httpServerInstance - The Express application instance (or similar server object).
 */
applicationInstance.onIncomingRequest = function handleRequestStart(httpServerInstance) {
    // Placeholder for any initial request processing logic.
    // E.g., logging request details, initializing a request context object.
    const requestInitiatedTimestamp = Date.now();
    // console.log(`Incoming request started at ${requestInitiatedTimestamp}`);
};

/**
 * Hook executed just before the request is routed to a specific handler.
 * Ideal for applying global middleware.
 * @param {object} httpServerInstance - The Express application instance.
 */
applicationInstance.beforeRoutingExecution = function applyPreRoutingMiddleware(httpServerInstance) {
    // Comment explaining middleware application
    // Here, we register global middleware functions that should run before any route matching.

    // Enable HTTP method overriding (e.g., using _method query parameter for PUT/DELETE)
    const methodOverrideMiddleware = webFramework.methodOverride();
    httpServerInstance.use(methodOverrideMiddleware);

    // Attach the language/locale management middleware
    // This middleware typically parses locale from headers/cookies/query and sets it for the request.
    const localeMiddleware = localeManager();
    httpServerInstance.use(localeMiddleware);
};

/**
 * Hook executed after a request has been routed and handled, but before the response is sent.
 * Useful for post-processing or error handling.
 * @param {object} httpServerInstance - The Express application instance.
 */
applicationInstance.afterRoutingExecution = function handlePostRouting(httpServerInstance) {
    // This hook is currently unused but can be extended for things like:
    // - Common response header modifications
    // - Final logging or analytics
    // - Error handling middleware that catches errors from routes
};

// Initiate the framework and start listening for incoming connections.
// If an error occurs during startup, it will be logged.
const applicationListener = frameworkCore.create(applicationInstance).listen(function (initializationError) {
    if (initializationError) {
        console.error('Application failed to start due to an error:', initializationError.message || initializationError);
        // Optionally, exit the process if startup is critical
        process.exit(1);
    } else {
        // Log successful startup message, including the port it's listening on
        const serverAddress = applicationListener.address();
        console.log(`Application services successfully initialized and listening on port ${serverAddress.port}`);
    }
});