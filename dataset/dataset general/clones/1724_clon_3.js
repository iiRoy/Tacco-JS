'use strict'; // Enforcing strict mode for cleaner code execution

// Core utility for managing background processes
const processManager = require('daemon');
// File system operations handler
const fileHandler = require('fs');

/**
 * Default configuration settings for the background task.
 * These act as fallback values if specific options are not provided.
 */
const baseConfiguration = {
    enableAuth: false, // Flag to determine if user authentication is required
    secureChannel: false, // Flag to enable secure communication protocols (e.g., SSL/TLS)
    verboseLogging: false // New dummy option for Type III clone
};

/**
 * Initiates and manages a long-running background process.
 * This function takes a script path, runtime parameters, and operational configurations
 * to spawn a daemonized process.
 *
 * @param {string} targetModulePath - The path to the JavaScript module to be executed as a daemon.
 * @param {object} runtimeSettings - An object containing various parameters for the daemon process.
 * @param {object} operationalParameters - Optional object to override default operational settings.
 */
module.exports = function (targetModulePath, runtimeSettings, operationalParameters) {

    // --- Input Validation and Configuration Merging ---

    // Ensure the target script path is provided and is a string.
    if (typeof targetModulePath !== 'string' || targetModulePath.trim().length === 0) {
        console.error('Error: A valid target module path must be provided.');
        throw new Error('Invalid script path for daemonization.');
    }

    // Ensure runtime settings are at least an empty object to prevent errors.
    const effectiveSettings = runtimeSettings || {};

    // Merge provided operational parameters with base configurations.
    // Object.assign creates a new object, ensuring baseConfiguration is not mutated.
    const finalConfiguration = Object.assign({}, baseConfiguration, operationalParameters);

    // --- Log File Setup ---

    let processLogFileDescriptor;
    try {
        // Attempt to open the log file synchronously for appending.
        // It will create the file if it doesn't exist.
        processLogFileDescriptor = fileHandler.openSync(effectiveSettings.logFilePath, 'a');
    } catch (fileOpenError) {
        console.error(`Failed to open log file at ${effectiveSettings.logFilePath}:`, fileOpenError.message);
        throw new Error('Critical error: Cannot initialize log file.');
    }

    // --- Constructing Command-Line Arguments ---

    // Initialize an array to hold all command-line arguments for the child process.
    // This array will be populated based on the provided runtime settings and configurations.
    const executionArguments = [];

    // Add fundamental connection parameters.
    // Using individual push operations for clarity, could also be a single push with spread.
    executionArguments.push('-h', effectiveSettings.serverAddress);
    executionArguments.push('-p', effectiveSettings.networkPort);
    executionArguments.push('-n', effectiveSettings.instanceCount);
    executionArguments.push('-l', effectiveSettings.bufferSize);
    executionArguments.push('-t', effectiveSettings.displayTheme);

    // Conditionally add authorization credentials if enabled in the configuration.
    if (finalConfiguration.enableAuth) {
        executionArguments.push(
            '-U', effectiveSettings.username,
            '-P', effectiveSettings.userPass
        );
    }

    // Include secure communication parameters if secure channel is activated.
    if (finalConfiguration.secureChannel) {
        executionArguments.push(
            '-k', effectiveSettings.securityKey,
            '-c', effectiveSettings.sslCert
        );
    }

    // Check for SSH tunneling requirements.
    // Note: The original code had `options.doSSH`, which is now `finalConfiguration.sshTunneling`.
    // I'm assuming `sshTunneling` is a property in `finalConfiguration` based on the original `doSSH`.
    if (finalConfiguration.sshTunneling) {
        executionArguments.push(
            '--remote-host', effectiveSettings.sshRemoteHost,
            '--remote-user', effectiveSettings.sshRemoteUser,
            '--remote-port', effectiveSettings.sshRemotePort
        );
    }

    // --- User Interface (UI) Related Argument Flags ---

    // Determine if the UI top bar should be hidden.
    if (effectiveSettings.hideInterfaceHeader) {
        executionArguments.push('--ui-hide-topbar');
    }

    // Adjust UI indentation settings.
    // Note: The original logic was `if (!params.uiIndent)`, which means if `uiIndent` is falsy, it adds `--ui-no-indent`.
    // My clone `formatWithIndent` is true by default, so if it's explicitly set to false, we add `--ui-no-indent`.
    if (effectiveSettings.formatWithIndent === false) {
        executionArguments.push('--ui-no-indent');
    }

    // Enable and configure syntax highlighting for the UI.
    if (effectiveSettings.syntaxHighlighting) {
        executionArguments.push('--ui-highlight', '--ui-highlight-preset', effectiveSettings.highlightScheme);
    }

    // Add a dummy argument based on a new configuration flag for Type III clone.
    if (finalConfiguration.verboseLogging) {
        executionArguments.push('--verbose-output');
    }

    // Finally, append any additional, unparsed arguments provided by the user.
    // Ensure `effectiveSettings.extraArgs` is an array or defaults to an empty array.
    if (Array.isArray(effectiveSettings.extraArgs) && effectiveSettings.extraArgs.length > 0) {
        // Using spread operator to push all elements from extraArgs.
        executionArguments.push(...effectiveSettings.extraArgs);
    } else if (effectiveSettings.extraArgs) {
        // Handle case where extraArgs might be a single string or non-array, push as is.
        executionArguments.push(String(effectiveSettings.extraArgs));
    }


    // --- Daemon Process Spawning ---

    // Prepare the options object for the daemon process.
    const daemonProcessOptions = {
        stdout: processLogFileDescriptor,
        stderr: processLogFileDescriptor,
        // Additional options could be added here for Type III, e.g., 'cwd'
        // cwd: '/var/lib/my-daemon-app'
    };

    let spawnedProcessHandle;
    try {
        // Spawn the background process using the process manager utility.
        spawnedProcessHandle = processManager.daemon(targetModulePath, executionArguments, daemonProcessOptions);
    } catch (daemonSpawnError) {
        console.error('Failed to spawn daemon process:', daemonSpawnError.message);
        fileHandler.closeSync(processLogFileDescriptor); // Ensure log file is closed on failure
        throw new Error('Daemonization failed.');
    }


    // --- PID File Management ---

    // Write the Process ID (PID) of the newly spawned daemon to a designated file.
    // This allows external tools to identify and manage the running process.
    if (effectiveSettings.processIdentifierFilePath) {
        try {
            fileHandler.writeFileSync(effectiveSettings.processIdentifierFilePath, spawnedProcessHandle.pid.toString());
        } catch (pidFileError) {
            // Log a warning if writing the PID fails, but don't halt the main process
            // as the daemon might still be running.
            console.warn(`Warning: Could not write PID to file ${effectiveSettings.processIdentifierFilePath}:`, pidFileError.message);
            // Optionally, we could attempt to kill the spawned process here if PID file is critical.
            // spawnedProcessHandle.kill();
        }
    } else {
        console.warn('No PID file path provided. Process ID will not be stored.');
    }

    // The log file descriptor is typically managed by the child process after daemonization.
    // However, if the parent process needs to ensure it's closed, it can do so.
    // For `daemon` module, the child process usually inherits and takes over.
    // Explicitly closing here might not be strictly necessary for daemon module,
    // but good practice if not inherited.
    // fileHandler.closeSync(processLogFileDescriptor);

    // Optionally, return the spawned process handle for further interaction from the parent,
    // though the original code does not.
    // return spawnedProcessHandle;
};