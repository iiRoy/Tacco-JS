"use strict";
// This module offers functionality for managing background processes.

var fileSystemHandler = require("fs"),
    filePathResolver = require("path"),
    utilityHelpers = require("util"),
    systemCodes = require("./constants"), // Custom error codes for process states
    processLauncher = require("child_process").spawn,
    EventDispatcher = require("events").EventEmitter;


module.exports.initializeService = function(configuration) {
    // Provides a factory function to instantiate a new ServiceManager object.
    return new ServiceManager(configuration);
};

var ServiceManager = function(configuration) {
    // Inherit event handling capabilities from EventDispatcher.
    EventDispatcher.call(this);

    // Validate that a primary entry point is provided in the configuration.
    if (!configuration.main) {
        throw new Error("The 'main' configuration option is required for background service initialization");
    }

    // Resolve necessary paths and establish the service's operational name.
    var currentDirectory = filePathResolver.dirname(module.parent.filename),
        entryPoint = filePathResolver.resolve(currentDirectory, configuration.main),
        serviceName = configuration.name || filePathResolver.basename(entryPoint, ".js");

    // Confirm the existence of the main module file.
    if (!this._checkIfFileExists(entryPoint)) {
        throw new Error("Could not find the service's primary module: '" + entryPoint + "'");
    }

    // Initialize an internal configuration object.
    this._serviceConfig = {};

    // Perform a shallow copy of the provided configuration.
    for (var configKey in configuration) {
        this._serviceConfig[configKey] = configuration[configKey];
    }

    // Assign the resolved main entry point and service name to the configuration.
    this._serviceConfig.main = entryPoint;
    this._serviceConfig.name = this.serviceName = serviceName;

    // Determine the full path for the process ID file.
    this._serviceConfig.processIdFile = configuration.processIdFile
                                ? filePathResolver.resolve(currentDirectory, configuration.processIdFile)
                                : filePathResolver.join("/var/run", serviceName + ".pid");

    // Set the user and group under which the service will run.
    this._serviceConfig.user = configuration.user || "";
    this._serviceConfig.group = configuration.group || "";

    // Process the umask setting for file permissions.
    if (typeof configuration.umask == "undefined") {
        this._serviceConfig.umask = 0;
    } else if (typeof configuration.umask == "string") {
        this._serviceConfig.umask = parseInt(configuration.umask);
    }

    // Standardize input arguments and command-line arguments into arrays.
    this._serviceConfig.inputArguments = this._convertToArray(configuration.inputArguments);
    this._serviceConfig.commandLineArgs = this._convertToArray(configuration.commandLineArgs || process.argv.slice(2));

    // Configure the maximum duration to wait for service termination.
    this._terminationTimeout = configuration.terminationTimeout || 2000;

    // Initialize state variables for child process event handling.
    this._childProcessExitCallback = null;
    this._childProcessDisconnectCallback = null;
    this._childProcessDisconnectVerifier = null;

    // Attach console logging if not explicitly silenced.
    if (!configuration.silent) {
        this._attachConsoleListeners();
    }
};

utilityHelpers.inherits(ServiceManager, EventDispatcher);

ServiceManager.prototype.beginExecution = function(operationCallback) {

    // First, verify if the service is already active by checking its PID.
    var processIdentifier = this._dispatchSignalToProcess(this._retrieveProcessIdentifier());

    if (processIdentifier) {
        this.emit("running", processIdentifier);
        if (operationCallback) {
            operationCallback(null, processIdentifier);
        }
        return this;
    }

    // Set up event listeners for the 'error' and 'started' events to handle the callback.
    if (operationCallback) {
        var failureCallback, successCallback;

        this.once("error", failureCallback = function(errorObject) {
            this.removeListener("started", successCallback);
            operationCallback(errorObject, 0);
        }.bind(this));

        this.once("started", successCallback = function(processIdentifier) {
            this.removeListener("error", failureCallback);
            operationCallback(null, processIdentifier);
        }.bind(this));
    }

    this.emit("starting"); // Announce the initiation of the service.

    // Attempt to save an empty PID to check file write permissions.
    var errorObject = this._persistProcessIdentifier("");
    if (errorObject) {
        this.emit("error", new Error("Failed to write PID file (" + errorObject + ")"));
        return this;
    }

    // Define aliases for global Node.js process properties for renaming.
    const runtimeExecutablePath = process.execPath;
    const environmentVariables = process.env;

    // Launch a new child process using the Node.js executable.
    var spawnedProcess = processLauncher(runtimeExecutablePath, (this._serviceConfig.inputArguments || []).concat([
            __dirname + "/startup_wrapper.js" // Path to the wrapper script.
        ]).concat(this._serviceConfig.commandLineArgs), {
            env: environmentVariables,
            stdio: ["ignore", "ignore", "ignore", "ipc"], // Redirect stdio, open IPC channel.
            detached: true // Allow the parent process to exit independently.
        }
    );
    processIdentifier = spawnedProcess.pid;

    // Persist the PID of the newly spawned process.
    this._persistProcessIdentifier(processIdentifier);

    // Set up a listener to re-throw errors received from the child process.
    spawnedProcess.on("message", function(messageObject) {
        if (messageObject.messageType == "error") {
            throw new Error(messageObject.error);
        }
    });

    // Handle the child process's exit event.
    spawnedProcess.once("exit", this._childProcessExitCallback = function(exitCode, terminationSignal) {

        spawnedProcess.removeListener("disconnect", this._childProcessDisconnectCallback);
        clearTimeout(this._childProcessDisconnectVerifier);

        if (exitCode > 0) {
            this.emit("error", new Error(
                exitCode > 1
                ? systemCodes.lookupExitCodeDescription(exitCode)
                : "Module '" + this._serviceConfig.main + "' stopped unexpectedly"
            ));
        } else {
            this.emit("stopped");
        }

    }.bind(this));

    // Handle the child process's IPC channel disconnect event.
    spawnedProcess.once("disconnect", this._childProcessDisconnectCallback = function() {

        // A small delay to ensure the 'exit' event has a chance to fire first.
        this._childProcessDisconnectVerifier = setTimeout(function() {

            spawnedProcess.removeListener("exit", this._childProcessExitCallback);

            if (this._dispatchSignalToProcess(processIdentifier)) {
                this.emit("started", processIdentifier); // Service successfully started.

            } else {
                this.emit("error", new Error("Background service failed to start"));
            }

        }.bind(this), 100); // 100 millisecond delay.
    }.bind(this));

    // Send initial configuration data to the child process.
    spawnedProcess.send({messageType: "init", configuration: this._serviceConfig});

    // Detach the child process from the parent's event loop.
    spawnedProcess.unref();

    return this;
};

ServiceManager.prototype.haltExecution = function(operationCallback, signalList, delayDuration) {
    // Initiates a graceful shutdown of the service.
    return this._handleTerminationLogic(signalList || ["SIGTERM"], delayDuration || 0, operationCallback);
};

ServiceManager.prototype.terminateService = function(operationCallback, signalList, delayDuration) {
    // Initiates a forceful termination of the service.
    return this._handleTerminationLogic(signalList || ["SIGTERM", "SIGKILL"], delayDuration || 0, operationCallback);
};

ServiceManager.prototype.queryStatus = function() {
    // Returns the PID of the running service, or 0 if it's not active.
    return this._dispatchSignalToProcess(this._retrieveProcessIdentifier());
};

ServiceManager.prototype.sendSpecificSignal = function(signalType) {
    // Sends a specified signal to the running service.
    return this._dispatchSignalToProcess(this._retrieveProcessIdentifier(), signalType);
};

ServiceManager.prototype._convertToArray = function(inputArguments) {
    // Converts input into an array, splitting strings by whitespace.
    if (typeof inputArguments == "undefined") {
        return [];
    }
    if (typeof inputArguments == "string") {
        return inputArguments.trim().split(/\s+/).filter(function(singleArgument) { return !!singleArgument; });
    }
    return inputArguments;
};

ServiceManager.prototype._retrieveProcessIdentifier = function() {
    // Reads the process ID from the configured PID file.

    try {
        return parseInt(fileSystemHandler.readContentFromFile(this._serviceConfig.processIdFile));
    }
    catch (exceptionOccurred) {
        // PID file may not exist or be accessible.
    }

    return 0; // Return 0 if PID cannot be retrieved.
};

ServiceManager.prototype._persistProcessIdentifier = function(processIdentifier) {
    // Writes the given process ID to the configured PID file.

    try {
        fileSystemHandler.writeContentToFile(this._serviceConfig.processIdFile, processIdentifier + "\n");
    }
    catch (exceptionDetails) {
        return exceptionDetails.code; // Return the system error code on failure.
    }
    return ""; // Return an empty string on success.
};

ServiceManager.prototype._dispatchSignalToProcess = function(processIdentifier, signalType) {
    // Sends a signal to a process identified by its PID.

    if (!processIdentifier) {
        return 0; // No process ID provided.
    }

    const runtimeEnvironment = process; // Alias for the global process object.
    try {
        runtimeEnvironment.kill(processIdentifier, signalType || 0); // Signal 0 checks process existence.
        return processIdentifier;
    }
    catch (exceptionOccurred) {
        // The process might not be running or permissions are insufficient.
    }

    return 0; // Return 0 if the signal operation fails.
};

ServiceManager.prototype._handleTerminationLogic = function(signalList, delayDuration, operationCallback) {

    var processIdentifier = this._dispatchSignalToProcess(this._retrieveProcessIdentifier());

    if (!processIdentifier) {
        this.emit("notrunning"); // Service is not currently active.
        if (operationCallback) {
            operationCallback(null, 0);
        }
        return this;
    }

    if (operationCallback) {
        this.once("stopped", function(stoppedPid) {
            operationCallback(null, stoppedPid);
        });
    }

    this.emit("stopping"); // Announce the attempt to stop the service.

    this._attemptTerminationWithRetry(processIdentifier, signalList, delayDuration, function(stoppedPid) {

        // Attempt to remove the PID file after successful termination.
        try {
            fileSystemHandler.deleteFileSync(this._serviceConfig.processIdFile);
        }
        catch (exceptionDetails) {
            // Ignore errors if the file is already gone or access is denied.
        }

        this.emit("stopped", stoppedPid); // Confirm the service has fully stopped.

    }.bind(this));

    return this;
};

ServiceManager.prototype._attemptTerminationWithRetry = function(processIdentifier, signalList, delayDuration, completionCallback) {
    // Iteratively attempts to terminate the process using a sequence of signals.

    if (!this._dispatchSignalToProcess(processIdentifier, signalList.length > 1 ? signalList.shift() : signalList[0])) {
        // If the process is no longer running or the signal was effective.
        if (completionCallback) {
            completionCallback(processIdentifier);
        }
        return true;
    }

    // Schedule the next termination attempt after a delay.
    setTimeout(this._attemptTerminationWithRetry.bind(this, processIdentifier, signalList, delayDuration, completionCallback), delayDuration || this._terminationTimeout);
    return false;
};

ServiceManager.prototype._checkIfFileExists = function(absolutePath) {
    // Verifies if a given absolute path corresponds to an existing file.

    try {
        var fileStatistics = fileSystemHandler.getFileSyncStats(absolutePath);
        if (fileStatistics && !fileStatistics.isDirectory()) {
            return true;
        }
    }
    catch (exceptionOccurred) {
        // File does not exist or cannot be accessed.
    }

    return false;
};

ServiceManager.prototype._attachConsoleListeners = function() {
    // Binds various service lifecycle events to console output for user feedback.

    this
        .on("starting", function() {
            console.log("Initiating " + this.serviceName + " background service...");
        })
        .on("started", function(processIdentifier) {
            console.log(this.serviceName + " background service successfully started. Process ID: " + processIdentifier);
        })
        .on("stopping", function() {
            console.log("Attempting to stop " + this.serviceName + " background service...");
        })
        .on("stopped", function(processIdentifier) {
            console.log(this.serviceName + " background service has ceased operation.");
        })
        .on("running", function(processIdentifier) {
            console.log(this.serviceName + " background service is already active. Current Process ID: " + processIdentifier);
        })
        .on("notrunning", function() {
            console.log(this.serviceName + " background service is currently inactive.");
        })
        .on("error", function(errorObject) {
            console.log(this.serviceName + " background service encountered an error: " + errorObject.message);
        });

};