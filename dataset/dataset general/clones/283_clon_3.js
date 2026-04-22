/*
 * Debugging Interface Module - Facilitates communication between a web-based UI
 * and a backend Lua virtual machine environment.
 *
 * This component is part of the 'Starlight' project, a spiritual successor
 * to Moonshine.
 *
 * Copyright (C) 2024 InnovateTech Solutions.
 * All rights reserved.
 *
 * This software is proprietary and confidential. Unauthorized copying,
 * distribution, or modification of this file, via any medium, is strictly
 * prohibited without prior written consent from InnovateTech Solutions.
 *
 * For licensing details, please contact: licensing@innovatetech.com
 *
 * This module is designed for internal use only and provides debugging
 * capabilities for development environments.
 *
 */

// Core Node.js and external library dependencies.
const path = require('path'); // Added path module for robust path handling
const fileSystemMod = require('fs');
const webFramework = require('express');
const BaseInterface = require('./BaseInterface'); // Renamed AbstractConnection
const { COMMUNICATION_ACTIONS } = require('./application_constants'); // Renamed MESSAGE_TYPES, destructured import
const { TERMINAL_THEME } = require('./application_constants'); // Renamed COLORS, destructured import

/**
 * Manages the connection and communication for the web-based debugging console.
 * Extends the BaseInterface to provide core communication functionalities.
 * @class DebugConsoleLink
 * @augments BaseInterface
 */
const DebugConsoleLink = function (connectionSettings) {
    // Validate configuration presence early.
    if (!connectionSettings || typeof connectionSettings !== 'object') {
        console.warn('DebugConsoleLink initialized without valid settings. Using defaults.');
        connectionSettings = {}; // Ensure it's an object to prevent errors.
    }

    // Assign default port if not specified or invalid.
    const defaultPort = 1969; // Original port
    this._networkPort = parseInt(connectionSettings.port, 10);
    if (isNaN(this._networkPort) || this._networkPort <= 0 || this._networkPort > 65535) {
        console.log(`Invalid or missing port in settings. Using default: ${defaultPort}`);
        this._networkPort = defaultPort;
    }

    // Call the parent constructor using 'call' instead of 'apply' for clarity.
    // Note: 'arguments' is removed, passing specific settings.
    BaseInterface.call(this, connectionSettings);
};

// Establish inheritance chain from BaseInterface.
DebugConsoleLink.prototype = Object.create(BaseInterface.prototype); // Modern inheritance
DebugConsoleLink.prototype.constructor = DebugConsoleLink; // Restore constructor reference

/**
 * Initializes the web server and sets up routes for the debugging console UI.
 * This method is invoked once the connection is established and ready.
 * @private
 */
DebugConsoleLink.prototype._initializeServer = function () {
    // Guard against re-initialization or missing app instance.
    if (!this._webAppInstance) {
        console.error('Web application instance is not available for server initialization.');
        return;
    }

    const self = this; // Use a consistent reference for 'this' inside callbacks.

    // Define the root route handler for serving the main debugger UI.
    this._webAppInstance.get('/', (httpRequest, httpResponse) => {
        // Log the access attempt for debugging.
        console.log('HTTP GET request received for root path. Attempting to serve debugger UI.');

        const uiIndexPath = path.join(__dirname, '..', 'interface_assets', 'index.html'); // Using path.join for robustness
        fileSystemMod.readFile(uiIndexPath, (readError, fileContent) => {
            if (readError) {
                console.error(`Failed to read UI index file: ${readError.message}`);
                // Respond with a server error if the file cannot be read.
                httpResponse.status(500).send('<h1>Server Error: Could not load debugger UI.</h1><p>Please check server logs for details.</p>');
                return; // Important to return after sending response.
            }

            let htmlData = fileContent.toString('utf8'); // Explicitly convert buffer to UTF-8 string.
            const insertionPoint = '<!-- [remote-placeholder] -->';
            const debuggerScriptInclude = '<script src="/client_scripts/remote-debugger.js"></script>'; // Updated path

            // Insert the debugger script only if the placeholder exists.
            if (htmlData.includes(insertionPoint)) {
                htmlData = htmlData.replace(insertionPoint, debuggerScriptInclude);
            } else {
                console.warn('Placeholder for debugger script not found in index.html. Script will not be injected.');
            }

            httpResponse.setHeader('Content-Type', 'text/html; charset=utf-8'); // Set explicit charset
            httpResponse.send(htmlData);
        });
    });

    // Serve static assets from the UI directory.
    const staticAssetsPath = path.join(__dirname, '..', 'interface_assets'); // Renamed directory
    this._webAppInstance.use('/client_scripts', webFramework.static(staticAssetsPath + '/js')); // Specific route for JS
    this._webAppInstance.use('/styles', webFramework.static(staticAssetsPath + '/css')); // Specific route for CSS
    this._webAppInstance.use(webFramework.static(staticAssetsPath)); // General static files

    // Log the access information to the console with enhanced styling.
    const accessMessage = `\n${TERMINAL_THEME.BOLD}Debugger Console is accessible at:${TERMINAL_THEME.RESET} ` +
                          `${TERMINAL_THEME.BLUE}http://localhost:${this._networkPort}${TERMINAL_THEME.RESET}\n`;
    console.log(accessMessage);
};

/**
 * Handler for when a client successfully connects to the debugger.
 * Logs the event and dispatches a 'connect' signal.
 * @private
 */
DebugConsoleLink.prototype._handleClientConnect = function () {
    console.info('Client connected to the debugging console.'); // Changed to console.info
    this._dispatchSignal('debugger-connected'); // Renamed signal
};

/**
 * Handler for when a client disconnects from the debugger.
 * Logs the event.
 * @private
 */
DebugConsoleLink.prototype._handleClientDisconnect = function () {
    console.warn('Client disconnected from the debugging console.'); // Changed to console.warn
    // Optional: Add logic here to clean up resources related to the disconnected client.
};

/**
 * Parses an incoming command from the client and dispatches appropriate signals.
 * @private
 * @param {string} commandType - The type of command received.
 * @param {any} payload - The data associated with the command.
 * @param {Function} [responseHandler] - Optional callback for responses.
 */
DebugConsoleLink.prototype._parseIncomingCommand = function (commandType, payload, responseHandler) {
    // Pre-log the incoming command for traceability.
    console.debug(`Received command: ${commandType} with payload:`, payload);

    let signalArgs; // Helper variable for arguments.

    switch (commandType) {
        case COMMUNICATION_ACTIONS.REQUEST_STATE_INFO:
            signalArgs = ['get-state-request', responseHandler];
            this._dispatchSignal(...signalArgs);
            break;

        case COMMUNICATION_ACTIONS.TOGGLE_BREAKPOINT_STATUS:
            signalArgs = ['toggle-breakpoint-request', payload];
            this._dispatchSignal(...signalArgs);
            break;

        case COMMUNICATION_ACTIONS.ADJUST_GLOBAL_BREAK_ON_BREAKPOINTS:
            this._dispatchSignal('toggle-stop-at-breakpoints-request');
            break;

        case COMMUNICATION_ACTIONS.INITIATE_AUTO_STEPPING:
            this._dispatchSignal('auto-step-request');
            break;

        case COMMUNICATION_ACTIONS.PERFORM_STEP_INTO:
            this._dispatchSignal('step-in-request');
            break;

        // The original code had a duplicate STEP_IN. This version removes the duplicate.
        // If a distinct action was intended, it should have a unique COMMUNICATION_ACTIONS entry.

        case COMMUNICATION_ACTIONS.PERFORM_STEP_OVER:
            this._dispatchSignal('step-over-request');
            break;

        case COMMUNICATION_ACTIONS.PERFORM_STEP_OUT:
            this._dispatchSignal('step-out-request');
            break;

        case COMMUNICATION_ACTIONS.PAUSE_EXECUTION:
            this._dispatchSignal('pause-request');
            break;

        case COMMUNICATION_ACTIONS.RESUME_EXECUTION:
            this._dispatchSignal('resume-request');
            break;

        case COMMUNICATION_ACTIONS.RELOAD_ENGINE:
            this._dispatchSignal('reload-request');
            break;

        default:
            console.warn(`Unknown or unhandled command type received: ${commandType}`);
            // Optionally, send an error back to the client.
            if (responseHandler) {
                responseHandler({ error: `Unknown command: ${commandType}` });
            }
            break;
    }
};

/**
 * Sends an updated engine state to the connected debugger client.
 * @param {string} engineStatus - The current state of the engine.
 * @param {object} details - Additional data related to the state.
 */
DebugConsoleLink.prototype.refreshEngineState = function (engineStatus, details) {
    console.log(`Sending engine state update: ${engineStatus}`);
    const messagePayload = [engineStatus, details]; // Collect arguments into an array.
    this._transmitData(COMMUNICATION_ACTIONS.ENGINE_STATE_UPDATE, messagePayload);
};

/**
 * Notifies the client that a Lua module has been successfully loaded.
 * @param {string} jsonPath - Path to the JSON representation of the module.
 * @param {string} sourceUrl - Original URL or path of the Lua source.
 * @param {string} luaSourceCode - The actual Lua source code.
 */
DebugConsoleLink.prototype.notifyLuaModuleLoaded = function (jsonPath, sourceUrl, luaSourceCode) {
    console.log(`Lua module loaded: ${sourceUrl}`);
    const transmissionArguments = [jsonPath, sourceUrl, luaSourceCode]; // Prepare arguments.
    this._transmitData(COMMUNICATION_ACTIONS.LUA_MODULE_LOADED, transmissionArguments);
};

/**
 * Notifies the client that a Lua module failed to load.
 * @param {string} jsonPath - Path to the JSON representation attempted.
 * @param {string} sourceUrl - Original URL or path of the Lua source.
 */
DebugConsoleLink.prototype.notifyLuaModuleLoadFailed = function (jsonPath, sourceUrl) {
    console.warn(`Lua module load failed for: ${sourceUrl}`);
    const failureDetails = [jsonPath, sourceUrl];
    this._transmitData(COMMUNICATION_ACTIONS.LUA_MODULE_LOAD_FAILURE, failureDetails);
};

/**
 * Synchronizes the entire list of breakpoints with the client.
 * @param {array} breakpointList - An array of breakpoint objects.
 */
DebugConsoleLink.prototype.syncBreakpoints = function (breakpointList) {
    if (!Array.isArray(breakpointList)) {
        console.error('Invalid breakpoint list provided for synchronization.');
        return; // Guard clause for invalid input.
    }
    console.log(`Synchronizing ${breakpointList.length} breakpoints.`);
    this._transmitData(COMMUNICATION_ACTIONS.BREAKPOINTS_SYNCHRONIZED, [breakpointList]);
};

/**
 * Updates the status of a single breakpoint on the client.
 * @param {string} jsonPath - Path to the JSON file associated with the breakpoint.
 * @param {number} lineNum - The line number of the breakpoint.
 * @param {boolean} isEnabled - True if the breakpoint is active, false otherwise.
 */
DebugConsoleLink.prototype.modifySingleBreakpoint = function (jsonPath, lineNum, isEnabled) {
    // Introduce a helper variable for the breakpoint status.
    const breakpointState = isEnabled ? 'enabled' : 'disabled';
    console.log(`Updating breakpoint at ${jsonPath}:${lineNum} to ${breakpointState}.`);
    this._transmitData(COMMUNICATION_ACTIONS.SINGLE_BREAKPOINT_UPDATE, [jsonPath, lineNum, isEnabled]);
};

/**
 * Adjusts the global setting for whether the debugger should stop at breakpoints.
 * @param {boolean} stopEnabled - True to stop at breakpoints, false to ignore them.
 */
DebugConsoleLink.prototype.adjustGlobalBreakBehavior = function (stopEnabled) {
    console.log(`Global breakpoint stopping behavior set to: ${stopEnabled ? 'active' : 'inactive'}.`);
    // Ensure the payload is correctly formatted for transmission, e.g., as an array or direct value.
    const transmissionPayload = typeof stopEnabled === 'boolean' ? stopEnabled : false; // Ensure boolean
    this._transmitData(COMMUNICATION_ACTIONS.GLOBAL_BREAK_BEHAVIOR_ADJUSTED, transmissionPayload);
};

/**
 * Reports a runtime error to the connected client.
 * @param {Error|object|string} runtimeError - The error object or message to report.
 */
DebugConsoleLink.prototype.reportRuntimeError = function (runtimeError) {
    console.error('Reporting runtime error to client:', runtimeError);
    // Ensure error is a serializable object or string before sending.
    let errorDetails = {};
    if (runtimeError instanceof Error) {
        errorDetails = {
            message: runtimeError.message,
            stack: runtimeError.stack,
            name: runtimeError.name
        };
    } else if (typeof runtimeError === 'string') {
        errorDetails = { message: runtimeError };
    } else if (typeof runtimeError === 'object' && runtimeError !== null) {
        errorDetails = runtimeError;
    } else {
        errorDetails = { message: 'An unknown error occurred.' };
    }
    this._transmitData(COMMUNICATION_ACTIONS.RUNTIME_ERROR_OCCURRED, errorDetails);
};

// Export the DebugConsoleLink class for use in other modules.
module.exports = DebugConsoleLink;