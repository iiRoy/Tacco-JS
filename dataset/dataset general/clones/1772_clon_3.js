// This file is part of a utility for managing background processes.
//
// Copyright (c) 2023 [Your Name/Company Name]
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

"use strict"; // Enforce strict parsing and error handling for robust code execution

const fileSys = require("node:fs"); // Core module for file system operations
const pathUtil = require("node:path"); // Core module for path manipulation
const sysUtil = require("node:util"); // Core module for utility functions
const processCodes = require("./process_exit_codes"); // Custom module containing application-specific exit codes
const childProcSpawn = require("node:child_process").spawn; // Function for spawning child processes
const EventDispatcher = require("node:events").EventEmitter; // Class for event handling

// Public interface: Factory function to create a new service manager instance.
module.exports.createManagedService = function(operationalSettings) {
    // Instantiate and return a new service orchestrator.
    return new BackgroundService(operationalSettings);
};

// Represents a service orchestrator responsible for managing a background process.
const BackgroundService = function(operationalSettings) {
    // Initialize event emitter capabilities from the parent class.
    EventDispatcher.call(this);

    // Ensure the primary module path is provided for the service.
    if (!operationalSettings || typeof operationalSettings !== 'object' || !operationalSettings.primaryModulePath) {
        throw new Error("Missing or invalid 'primaryModulePath' setting for background service initialization. Expected an object with 'primaryModulePath'.");
    }

    const currentDirectory = pathUtil.dirname(module.parent.filename);
    const primaryModuleAbsolutePath = pathUtil.resolve(currentDirectory, operationalSettings.primaryModulePath);
    const serviceIdentifier = operationalSettings.serviceName || pathUtil.basename(primaryModuleAbsolutePath, ".js");

    // Validate if the main service module actually exists on the filesystem.
    if (!this.checkPathIsFile(primaryModuleAbsolutePath)) {
        throw new Error(`Cannot locate the primary service module: '${primaryModuleAbsolutePath}'`);
    }

    // Initialize configuration parameters for this service instance.
    this.configParams = {};
    // Perform a shallow copy of provided settings, ensuring immutability of the original object.
    Object.assign(this.configParams, operationalSettings);

    // Assign canonical paths and identifiers.
    this.configParams.primaryModulePath = primaryModuleAbsolutePath;
    this.configParams.serviceName = this.serviceName = serviceIdentifier; // Also expose serviceName directly

    // Determine the PID file path, defaulting to /var/run if not specified.
    this.configParams.pidfilePath = operationalSettings.pidfilePath
                                  ? pathUtil.resolve(currentDirectory, operationalSettings.pidfilePath)
                                  : pathUtil.join("/var/run", serviceIdentifier + ".pid");

    // Set user and group for process execution, defaulting to empty strings.
    this.configParams.executionUser = operationalSettings.executionUser || "";
    this.configParams.executionGroup = operationalSettings.executionGroup || "";

    // Handle umask setting, converting string to integer if necessary.
    // Default to 0 if not explicitly defined.
    let umaskValue = operationalSettings.fileCreationMask;
    if (typeof umaskValue === "undefined") {
        this.configParams.fileCreationMask = 0;
    } else if (typeof umaskValue === "string") {
        const parsedUmask = parseInt(umaskValue, 8); // Assume octal for umask string
        if (isNaN(parsedUmask)) {
            throw new Error(`Invalid 'fileCreationMask' value: '${umaskValue}'. Must be an octal string or number.`);
        }
        this.configParams.fileCreationMask = parsedUmask;
    } else if (typeof umaskValue === "number") {
        this.configParams.fileCreationMask = umaskValue;
    } else {
        throw new Error(`Unsupported 'fileCreationMask' type: ${typeof umaskValue}. Expected string or number.`);
    }

    // Normalize command-line arguments.
    this.configParams.startupArguments = this.normalizeArgumentArray(operationalSettings.startupArguments);
    this.configParams.processArguments = this.normalizeArgumentArray(operationalSettings.processArguments || process.argv.slice(2));

    // Set the grace period for process shutdown.
    this.shutdownGracePeriodMs = operationalSettings.shutdownGracePeriodMs || 2000;

    // Internal state handlers for child process events.
    this.childProcessExitListener = null;
    this.childProcessDisconnectListener = null;
    this.disconnectDetectionTimer = null; // Timer for detecting disconnects

    // Conditionally attach console logging handlers based on 'silentMode' setting.
    if (!operationalSettings.silentMode) {
        this.attachConsoleHandlers();
    }
};
// Establish inheritance from EventEmitter to enable event emission.
sysUtil.inherits(BackgroundService, EventDispatcher);

/**
 * Initiates the background service process.
 * If the service is already running, it will emit a 'serviceRunning' event.
 *
 * @param {Function} [completionCallback] - An optional callback function (err, pid) to be invoked upon service start or error.
 * @returns {BackgroundService} - The current service instance for chaining.
 */
BackgroundService.prototype.initiateService = function(completionCallback) {
    // First, check if an instance of this service is already active.
    const existingServicePid = this.dispatchSignal(this.retrieveProcessId());

    if (existingServicePid) {
        this.emit("serviceRunning", existingServicePid);
        if (completionCallback) {
            completionCallback(null, existingServicePid);
        }
        return this; // Service is already up, no need to start again.
    }

    // Prepare callback handling for asynchronous startup events.
    if (completionCallback) {
        let startupErrorListener, startupSuccessListener;

        // Listener for startup errors.
        this.once("serviceError", startupErrorListener = (issue) => {
            this.removeListener("serviceStarted", startupSuccessListener); // Clean up success listener
            completionCallback(issue, 0);
        });

        // Listener for successful startup.
        this.once("serviceStarted", startupSuccessListener = (activePid) => {
            this.removeListener("serviceError", startupErrorListener); // Clean up error listener
            completionCallback(null, activePid);
        });
    }

    // Announce the intention to start the service.
    this.emit("serviceInitiating");

    // Attempt to create or update the PID file with an empty placeholder initially.
    const writeError = this.persistProcessId("");
    if (writeError) {
        const pidFileError = new Error(`Failed to write PID file (${writeError.message || writeError}). Check permissions.`);
        this.emit("serviceError", pidFileError);
        return this;
    }

    // Define the arguments for the child process.
    const processArgs = (this.configParams.startupArguments || []).concat([
        pathUtil.join(__dirname, "wrapper_module.js") // Use a renamed wrapper script
    ]).concat(this.configParams.processArguments);

    // Spawn the child process that will host the background service.
    const spawnedProcess = childProcSpawn(process.execPath, processArgs, {
            env: process.env, // Inherit environment variables
            stdio: ["ignore", "ignore", "ignore", "ipc"], // Standard I/O ignored, IPC channel enabled
            detached: true // Allow child to run independently of parent
        }
    );
    const newServicePid = spawnedProcess.pid;

    // Persist the actual PID of the newly spawned process.
    this.persistProcessId(newServicePid);

    // Set up a listener for messages from the child process.
    // Specifically, re-throw any errors reported by the child.
    spawnedProcess.on("message", (messagePayload) => {
        if (messagePayload && messagePayload.type === "error") {
            // Log and re-throw child process errors to the parent's event system.
            const childError = new Error(`Child process reported error: ${messagePayload.error}`);
            this.emit("serviceError", childError); // Emit an event for external handling
            // Optionally, we could choose to terminate the parent or child here
            // For now, mirroring the original behavior by re-throwing.
            throw childError;
        }
    });

    // Handle the child process exiting.
    spawnedProcess.once("exit", this.childProcessExitListener = (exitCode, terminationSignal) => {
        // Clean up listeners and timers related to this child process.
        spawnedProcess.removeListener("disconnect", this.childProcessDisconnectListener);
        clearTimeout(this.disconnectDetectionTimer);

        if (exitCode > 0) {
            // Determine a more descriptive error message based on the exit code.
            const detailedError = exitCode > 1
                                ? processCodes.resolveCodeDescription(exitCode) // Custom error lookup
                                : `Primary module '${this.configParams.primaryModulePath}' terminated unexpectedly.`;
            this.emit("serviceError", new Error(detailedError));
        } else {
            this.emit("serviceTerminated"); // Emit a generic termination event
        }
    });

    // Handle the IPC channel disconnecting.
    spawnedProcess.once("disconnect", this.childProcessDisconnectListener = () => {
        // Set a short delay to differentiate between a clean exit and an unexpected disconnect.
        this.disconnectDetectionTimer = setTimeout(() => {
            spawnedProcess.removeListener("exit", this.childProcessExitListener); // Prevent exit listener from firing later

            // After disconnect, verify if the process is actually still running.
            if (this.dispatchSignal(newServicePid)) {
                this.emit("serviceStarted", newServicePid); // Confirm successful start
            } else {
                this.emit("serviceError", new Error("Background service failed to establish connection or start properly."));
            }
        }, 120); // Slightly adjusted timeout from 100ms
    });

    // Send initial configuration to the child process via IPC.
    spawnedProcess.send({ type: "initialize", settings: this.configParams });

    // Detach the child process from the parent's event loop to allow the parent to exit.
    spawnedProcess.unref();

    return this; // Enable method chaining.
};

/**
 * Initiates a graceful shutdown of the background service.
 * @param {Function} [completionCallback] - Callback (err, pid) when service stops.
 * @param {string[]} [terminationSignals] - Array of signals to attempt for shutdown (e.g., ['SIGTERM']).
 * @param {number} [terminationTimeoutMs] - Timeout in milliseconds for each signal attempt.
 * @returns {BackgroundService} - The current service instance.
 */
BackgroundService.prototype.gracefulShutdown = function(completionCallback, terminationSignals, terminationTimeoutMs) {
    // Default to SIGTERM for graceful shutdown.
    const signalsToUse = terminationSignals && terminationSignals.length > 0 ? terminationSignals : ["SIGTERM"];
    const timeoutToUse = terminationTimeoutMs || 0; // Use 0 for default internal timeout mechanism.
    return this.terminateProcess(signalsToUse, timeoutToUse, completionCallback);
};

/**
 * Forcibly terminates the background service.
 * @param {Function} [completionCallback] - Callback (err, pid) when service stops.
 * @param {string[]} [terminationSignals] - Array of signals to attempt for termination.
 * @param {number} [terminationTimeoutMs] - Timeout in milliseconds for each signal attempt.
 * @returns {BackgroundService} - The current service instance.
 */
BackgroundService.prototype.forceTerminate = function(completionCallback, terminationSignals, terminationTimeoutMs) {
    // Default to SIGTERM then SIGKILL for forceful termination.
    const signalsToUse = terminationSignals && terminationSignals.length > 0 ? terminationSignals : ["SIGTERM", "SIGKILL"];
    const timeoutToUse = terminationTimeoutMs || 0;
    return this.terminateProcess(signalsToUse, timeoutToUse, completionCallback);
};

/**
 * Queries the current operational status of the service by checking its PID.
 * @returns {number} - The PID if the service is running, otherwise 0.
 */
BackgroundService.prototype.queryStatus = function() {
    const currentPid = this.retrieveProcessId();
    // Sending signal 0 checks for process existence without sending an actual signal.
    return this.dispatchSignal(currentPid, 0);
};

/**
 * Relays a specific signal to the managed background service.
 * @param {string} signalName - The name of the signal to send (e.g., 'SIGHUP').
 * @returns {number} - The PID if the signal was dispatched, otherwise 0.
 */
BackgroundService.prototype.relaySignal = function(signalName) {
    const targetPid = this.retrieveProcessId();
    if (targetPid === 0) {
        // Emit an event if no process is found to signal.
        this.emit("noServiceFound", `Attempted to signal '${signalName}' but no PID was found.`);
        return 0;
    }
    return this.dispatchSignal(targetPid, signalName);
};

/**
 * Normalizes an input into an array of arguments.
 * Handles strings (space-separated) and undefined inputs.
 * @param {string|string[]|undefined} inputArgs - The arguments to normalize.
 * @returns {string[]} - An array of arguments.
 */
BackgroundService.prototype.normalizeArgumentArray = function(inputArgs) {
    // If no arguments are provided, return an empty array.
    if (typeof inputArgs === "undefined" || inputArgs === null) {
        return [];
    }
    // If a string, split by whitespace and filter out empty strings.
    if (typeof inputArgs === "string") {
        return inputArgs.trim().split(/\s+/).filter(Boolean);
    }
    // If already an array, return it as is.
    if (Array.isArray(inputArgs)) {
        return inputArgs;
    }
    // For any other unexpected type, return an empty array and optionally log a warning.
    console.warn(`Warning: Unexpected argument type for normalization: ${typeof inputArgs}. Returning empty array.`);
    return [];
};

/**
 * Retrieves the process ID (PID) from the stored PID file.
 * @returns {number} - The PID read from the file, or 0 if not found/error.
 */
BackgroundService.prototype.retrieveProcessId = function() {
    try {
        const pidContent = fileSys.readFileSync(this.configParams.pidfilePath, { encoding: "utf8" });
        const parsedPid = parseInt(pidContent.trim(), 10);
        // Ensure the parsed PID is a positive integer.
        if (isNaN(parsedPid) || parsedPid <= 0) {
            // Consider the file invalid if PID is not a positive number.
            return 0;
        }
        return parsedPid;
    } catch (readErr) {
        // If file doesn't exist or is unreadable, it means no PID is stored.
        if (readErr.code !== 'ENOENT') {
            // Log other file system errors but still return 0.
            console.error(`Error reading PID file '${this.configParams.pidfilePath}': ${readErr.message}`);
        }
        return 0;
    }
};

/**
 * Persists the given process ID (PID) into the designated PID file.
 * @param {number|string} pidToStore - The PID to write to the file.
 * @returns {Error|null} - An error object if writing failed, otherwise null.
 */
BackgroundService.prototype.persistProcessId = function(pidToStore) {
    try {
        // Ensure the directory for the PID file exists.
        const pidFileDir = pathUtil.dirname(this.configParams.pidfilePath);
        if (!fileSys.existsSync(pidFileDir)) {
            fileSys.mkdirSync(pidFileDir, { recursive: true, mode: 0o755 });
        }
        fileSys.writeFileSync(this.configParams.pidfilePath, String(pidToStore) + "\n", { mode: 0o644 });
        return null; // Success
    } catch (writeException) {
        // Return the exception for error handling upstream.
        return writeException;
    }
};

/**
 * Dispatches a signal to a specified process ID.
 * @param {number} targetPid - The PID of the process to signal.
 * @param {string} [signalType='0'] - The signal to send (e.g., 'SIGTERM'). '0' checks for existence.
 * @returns {number} - The PID if the signal was successfully dispatched or process exists, otherwise 0.
 */
BackgroundService.prototype.dispatchSignal = function(targetPid, signalType = '0') {
    // If no PID is provided, there's nothing to signal.
    if (!targetPid || targetPid <= 0) {
        return 0;
    }

    try {
        process.kill(targetPid, signalType);
        // If signal 0 was sent and no error, process exists.
        // If another signal was sent, assume it was successful.
        return targetPid;
    } catch (signalError) {
        // Common errors for non-existent processes: 'ESRCH' (No such process), 'EPERM' (Operation not permitted).
        if (signalError.code !== 'ESRCH' && signalError.code !== 'EPERM') {
            console.warn(`Warning: Failed to send signal '${signalType}' to PID ${targetPid}: ${signalError.message}`);
        }
        return 0; // Process does not exist or cannot be signaled.
    }
};

/**
 * Handles the core logic for terminating a process, including signal cascade and PID file cleanup.
 * @param {string[]} signalsToAttempt - An array of signals to try, in order.
 * @param {number} initialTimeoutMs - The initial timeout for the first signal, subsequent signals use `shutdownGracePeriodMs`.
 * @param {Function} [completionCallback] - Optional callback (err, pid) once termination is complete.
 * @returns {BackgroundService} - The current service instance.
 */
BackgroundService.prototype.terminateProcess = function(signalsToAttempt, initialTimeoutMs, completionCallback) {
    const currentPid = this.retrieveProcessId();

    if (!currentPid) {
        this.emit("serviceNotRunning");
        if (completionCallback) {
            completionCallback(null, 0);
        }
        return this;
    }

    // Wrap the completion callback to ensure it's only called once.
    let terminationCompleted = false;
    const finalCallbackWrapper = (finalPid) => {
        if (!terminationCompleted) {
            terminationCompleted = true;
            if (completionCallback) {
                completionCallback(null, finalPid);
            }
            this.emit("serviceTerminated", finalPid); // Emit a general "terminated" event
        }
    };

    // Attach a one-time listener for the service being formally stopped.
    this.once("serviceTerminated", (stoppedPid) => {
        // Attempt to remove the PID file upon successful termination.
        try {
            fileSys.unlinkSync(this.configParams.pidfilePath);
            this.persistProcessId(""); // Clear the PID file content explicitly
        } catch (unlinkEx) {
            // Log if PID file removal fails, but don't block termination flow.
            if (unlinkEx.code !== 'ENOENT') { // Ignore if file doesn't exist already
                console.error(`Warning: Failed to remove PID file '${this.configParams.pidfilePath}': ${unlinkEx.message}`);
            }
        }
        finalCallbackWrapper(stoppedPid);
    });

    this.emit("serviceShuttingDown"); // Announce shutdown intent

    // Start the recursive killing attempt.
    this.attemptTerminationIteration(currentPid, [...signalsToAttempt], initialTimeoutMs, finalCallbackWrapper);

    return this;
};

/**
 * Recursively attempts to terminate a process by sending signals from a list.
 * @param {number} processId - The PID of the process to terminate.
 * @param {string[]} remainingSignals - An array of signals yet to be sent.
 * @param {number} currentTimeout - The timeout for the current signal attempt.
 * @param {Function} onCompletion - Callback when process is confirmed terminated.
 * @returns {void}
 */
BackgroundService.prototype.attemptTerminationIteration = function(processId, remainingSignals, currentTimeout, onCompletion) {
    // If no more signals to try, or process is already gone, call completion.
    if (remainingSignals.length === 0 || !this.dispatchSignal(processId)) {
        onCompletion(processId);
        return;
    }

    const nextSignal = remainingSignals.shift(); // Get the next signal to try.

    // Send the signal. If it fails (process already gone), completion is handled by the check above.
    this.dispatchSignal(processId, nextSignal);

    // Schedule the next check/signal attempt after the timeout.
    // Use the instance's shutdownGracePeriodMs for subsequent timeouts if currentTimeout is 0.
    const effectiveTimeout = currentTimeout > 0 ? currentTimeout : this.shutdownGracePeriodMs;

    setTimeout(() => {
        this.attemptTerminationIteration(processId, remainingSignals, this.shutdownGracePeriodMs, onCompletion);
    }, effectiveTimeout);
};


/**
 * Checks if a given path points to an existing file (not a directory).
 * @param {string} filePath - The path to check.
 * @returns {boolean} - True if the path is a file, false otherwise.
 */
BackgroundService.prototype.checkPathIsFile = function(filePath) {
    try {
        const fileStats = fileSys.statSync(filePath);
        return fileStats.isFile(); // Return true only if it's a file.
    } catch (existenceError) {
        // Common error for non-existent files: 'ENOENT'
        if (existenceError.code !== 'ENOENT') {
            console.error(`Error checking file status for '${filePath}': ${existenceError.message}`);
        }
        return false;
    }
};

/**
 * Attaches standard console output handlers for various service lifecycle events.
 * This provides immediate feedback on the service's state changes.
 */
BackgroundService.prototype.attachConsoleHandlers = function() {
    const eventLogMap = {
        "serviceInitiating": () => `Initiating ${this.serviceName} background service...`,
        "serviceStarted": (pid) => `${this.serviceName} service started. PID: ${pid}`,
        "serviceShuttingDown": () => `Shutting down ${this.serviceName} service...`,
        "serviceTerminated": () => `${this.serviceName} service terminated.`,
        "serviceRunning": (pid) => `${this.serviceName} service is already running. PID: ${pid}`,
        "serviceNotRunning": () => `${this.serviceName} service is currently not active.`,
        "serviceError": (err) => `${this.serviceName} service encountered an error: ${err.message || err}`,
        "noServiceFound": (msg) => `${this.serviceName} service signal attempt failed: ${msg}`
    };

    for (const [eventName, logMessageFn] of Object.entries(eventLogMap)) {
        this.on(eventName, (...args) => {
            // Use console.info for informational messages, console.error for errors.
            const outputMethod = eventName.includes("Error") || eventName.includes("Failed") ? console.error : console.info;
            outputMethod(logMessageFn(...args));
        });
    }
};