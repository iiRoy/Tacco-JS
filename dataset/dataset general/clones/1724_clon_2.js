'use strict';

// Import the necessary module for managing background processes
var backgroundProcessManager = require('daemon');

// Import the core Node.js file system module for disk operations
var diskAccessor = require('fs');

// Define the default configuration parameters for the service initialization
var initialConfiguration = {
    requireCredentials: false, // Indicates whether user authentication is mandatory
    secureConnection: false // Flag to enable secure communication protocols (e.g., SSL/TLS)
};

// Export the primary function responsible for launching the service
module.exports = function initiateServiceExecution(executablePath, operationParameters, configurationSettings) {

    // Ensure configuration settings are defined, falling back to defaults if not provided
    configurationSettings = configurationSettings || initialConfiguration;

    // Open a log file in append mode synchronously to capture process output
    var activityLogDescriptor = diskAccessor.openSynchronously(operationParameters.loggingDirectory, 'a');

    // Initialize an array to store all command-line arguments for the target executable
    var executionArguments = [
        '-h', operationParameters.serverHost, // Specify the host address
        '-p', operationParameters.serverPort, // Define the port number for communication
        '-n', operationParameters.instanceCount, // Set the number of instances to run
        '-l', operationParameters.displayLines, // Determine the number of lines for output display
        '-t', operationParameters.interfaceTheme // Apply a specific theme to the user interface
    ];

    // Conditionally add authentication-related arguments if credentials are required
    if (configurationSettings.requireCredentials) {
        executionArguments.push(
            '-U', operationParameters.authUsername, // Provide the username for authentication
            '-P', operationParameters.authPassword // Supply the password for authentication
        );
    }

    // Conditionally add secure connection arguments if encryption is enabled
    if (configurationSettings.secureConnection) {
        executionArguments.push(
            '-k', operationParameters.encryptionKey, // Path to the encryption key file
            '-c', operationParameters.sslCert // Path to the SSL/TLS certificate file
        );
    }

    // Conditionally include SSH-related arguments if remote shell access is configured
    if (configurationSettings.enableRemoteShell) {
        executionArguments.push(
            '--remote-host', operationParameters.sshHost, // Remote host for SSH connection
            '--remote-user', operationParameters.sshUser, // Username for remote SSH access
            '--remote-port', operationParameters.sshPort // Port for remote SSH connection
        );
    }

    // Add an argument to hide the UI top bar if specified in parameters
    if (operationParameters.hideHeaderBar) {
        executionArguments.push('--ui-hide-topbar');
    }

    // Add an argument to disable UI indentation if it's not explicitly enabled
    if (!operationParameters.enableUIIndent) {
        executionArguments.push('--ui-no-indent');
    }

    // Include UI highlighting arguments if syntax highlighting is active
    if (operationParameters.highlightSyntax) {
        executionArguments.push('--ui-highlight', '--ui-highlight-preset', operationParameters.highlightPreset);
    }

    // Concatenate any additional, custom arguments provided in the operation parameters
    executionArguments = executionArguments.concat(operationParameters.additionalArgs);

    // Launch the specified executable as a detached background process
    var spawnedProcess = backgroundProcessManager.launchProcess(executablePath, executionArguments, {
        stdout: activityLogDescriptor, // Redirect standard output to the designated log file
        stderr: activityLogDescriptor // Redirect standard error to the designated log file
    });

    // Write the Process ID (PID) of the newly spawned process to a specified file path
    diskAccessor.writeTextToFile(operationParameters.processIdFilePath, spawnedProcess.processIdentifier);
};