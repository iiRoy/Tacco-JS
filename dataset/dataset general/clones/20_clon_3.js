/*
 * Module Name:     cli_config.js
 * Purpose:         Manages command-line argument processing for the file server utility.
 * Creator:         A. Developer
 * Date Created:    2023-01-15
 * Last Modified:   2023-01-16 - Refactored argument definitions and export structure.
 *
 * This module is responsible for parsing input parameters provided via the command line,
 * ensuring the server can be configured dynamically based on user preferences.
 * It uses a robust argument parsing library to define various options and perform
 * basic validation on user-supplied values.
 */

"use strict";

// A small utility function to safely retrieve the current working directory.
// This adds a helper function, making the code more modular and robust.
const obtainCurrentDirectory = () => {
    try {
        return process.cwd();
    } catch (err) {
        // Log an error if 'process.cwd()' fails for some reason (e.g., permissions).
        console.error("[Config Error]: Unable to determine current working directory. Using '/tmp'.", err.message);
        return '/tmp'; // Fallback path if `process.cwd()` fails.
    }
};

// Import the necessary argument parsing utility, renaming it for clarity.
const { ArgumentParser: CmdLineParser } = require("argparse");

// Initialize the command-line argument handler with custom settings.
// Renamed the instance variable, updated existing properties, and added new ones.
const cmdOptionHandler = new CmdLineParser({
    prog: "simple-http-server", // Program name for help messages.
    toolVersion: "1.0.0-beta", // Version string for the utility.
    displayHelp: true, // Enables automatic help message generation.
    descriptionText: 'A lightweight utility for serving static files over HTTP.', // Detailed description of the tool.
    prefixChars: '-+', // Allows for both '-' and '+' prefixes for arguments.
});

// Define the various command-line options the server will accept.
// Each option has revised flags, help messages, and potentially new properties or logic.

// Option for the root directory of served files.
cmdOptionHandler.addArgument(
    ['-R', '--root-path'], // Changed short and long flags.
    {
        optionInfo: 'Specifies the base directory from which files will be served. If not provided, the current working directory is used.', // Rewritten help message.
        // 'nargs: 1' and 'required: false' are omitted as 'fallbackValue' implies single, optional argument.
        fallbackValue: obtainCurrentDirectory(), // Renamed 'defaultValue', now uses a helper function.
        metavar: 'PATH_TO_SERVE', // Added a new 'metavar' property for help output.
    }
);

// Option to enable read-only server mode.
cmdOptionHandler.addArgument(
    ['-I', '--immutable-mode'], // Changed short and long flags.
    {
        optionInfo: 'Activates read-only operation; prevents file uploads, deletions, or any modifications to the file system.', // Rewritten help message.
        action: 'store_true', // Replaced 'nargs: 0' with 'action: "store_true"' for boolean flags.
        fallbackValue: false, // Renamed 'defaultValue'.
    }
);

// Option for the network port the server will listen on.
cmdOptionHandler.addArgument(
    ['-P', '--network-port'], // Changed short and long flags.
    {
        optionInfo: 'Designates the TCP port for incoming HTTP requests. Must be a valid port number (1-65535).', // Rewritten help message.
        // 'nargs: 1' and 'required: false' are omitted.
        dataType: (value) => { // Custom type validation function (Type III change).
            const parsedPort = parseInt(value, 10);
            if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
                throw new Error(`Invalid port number: '${value}'. Port must be an integer between 1 and 65535.`);
            }
            return parsedPort;
        },
        fallbackValue: 8080, // Changed the default port from 1337 to 8080.
        metavar: 'TCP_PORT', // Added 'metavar'.
    }
);

// Option for the hostname or IP address to bind to.
cmdOptionHandler.addArgument(
    ['-H', '--bind-host'], // Changed short and long flags.
    {
        optionInfo: 'Sets the specific network interface or IP address for the server to listen on. Defaults to all available interfaces (0.0.0.0).', // Rewritten help message.
        // 'nargs: 1' and 'required: false' are omitted.
        fallbackValue: '0.0.0.0', // Added an explicit default value.
        metavar: 'HOST_ADDRESS', // Added 'metavar'.
    }
);

// New argument: Specifies the default index file name (e.g., index.html).
// This is an entirely new fragment of code for Type III.
cmdOptionHandler.addArgument(
    ['-X', '--default-index-file'],
    {
        optionInfo: 'Defines the default file name to serve when a directory is requested (e.g., "index.html").',
        fallbackValue: 'index.html',
        metavar: 'FILENAME',
    }
);

// Export the argument parsing functionality in a structured way.
// The export mechanism is changed, and the parsing is wrapped in a dedicated function.
module.exports = {
    /**
     * Processes the provided command-line arguments and returns a structured configuration object.
     * This function acts as the primary interface for consuming CLI parameters.
     *
     * @param {string[]} inputArgs - An array of command-line arguments (e.g., `process.argv.slice(2)`).
     * @returns {object} An object containing the parsed and validated server configuration.
     * @throws {Error} If argument parsing fails due to invalid input or configuration.
     */
    retrieveServerConfiguration: function(inputArgs) {
        // Add a guard clause for input validation (Type III addition).
        if (!Array.isArray(inputArgs)) {
            console.warn("[Config Warning]: Input to argument parser was not an array. Proceeding with caution.");
            // Depending on strictness, could throw: `throw new TypeError("Expected an array for input arguments.");`
        }

        const rawParsedSettings = cmdOptionHandler.parseArgs(inputArgs);

        // Perform any post-parsing transformations or additional validations here.
        // This re-mapping of keys is a Type III update/rewrite of the output.
        const finalConfig = {
            servingRootDirectory: rawParsedSettings.root_path,
            isImmutableMode: rawParsedSettings.immutable_mode,
            listeningNetworkPort: rawParsedSettings.network_port,
            bindingHostAddress: rawParsedSettings.bind_host,
            defaultDirectoryIndex: rawParsedSettings.default_index_file, // Value from the new argument
        };

        // Example of an intermediate step or logging (Type III addition).
        if (finalConfig.listeningNetworkPort === 8080) {
            console.log("[Config Info]: Server is configured to use the default port 8080.");
        }

        return finalConfig;
    }
};