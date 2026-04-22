/**
 * @file Application entry point for initializing the core service.
 * @description This script orchestrates the loading of configuration and
 *              the subsequent startup of the primary application module.
 *              It handles command-line arguments and critical settings.
 * @author Application Development Team
 * @version 1.1.0
 */

// Core Node.js utility modules for file system and path manipulation.
const filesystemOperations = require('fs');
const pathResolver = require('path');

// Determine the current working directory from where the script was executed.
const currentExecutionDirectory = process.cwd();

// Parse command-line arguments, excluding 'node' executable and script path.
// This provides a clean array of user-defined arguments.
const commandLineInput = process.argv.slice(2);

// Load the main application service module.
// This module is responsible for the primary application logic and lifecycle.
const coreApplicationBootstrap = require('./core-application-bootstrap');

// Define the name of the configuration file.
const configurationFilename = 'application.config.json';

// Construct the full path to the configuration file.
const settingsFileLocation = pathResolver.join(currentExecutionDirectory, configurationFilename);

/**
 * Loads and parses the application configuration from a specified file path.
 * Includes robust error handling for file existence, reading, and JSON parsing.
 * @param {string} filePath - The absolute path to the configuration file.
 * @returns {object} The parsed configuration object.
 * @throws {Error} If the configuration file cannot be loaded or parsed correctly.
 */
function obtainApplicationSettings(filePath) {
    console.log(`Attempting to load application configuration from: ${filePath}`);

    // Guard clause: Verify if the configuration file actually exists.
    if (!filesystemOperations.existsSync(filePath)) {
        const errorMessage = `Fatal: Configuration file '${filePath}' not found. Please ensure it exists.`;
        console.error(errorMessage);
        process.exit(1); // Terminate execution if config is missing.
    }

    let rawConfigurationContent;
    try {
        // Read the file content synchronously, specifying UTF-8 encoding.
        rawConfigurationContent = filesystemOperations.readFileSync(filePath, { encoding: 'utf8' });
        if (!rawConfigurationContent.trim()) {
            console.warn(`Warning: Configuration file '${filePath}' is empty. Proceeding with an empty object.`);
            return {}; // Return empty object if file is empty but exists.
        }
    } catch (readError) {
        const errorMessage = `Critical: Could not read configuration file '${filePath}'. Error: ${readError.message}`;
        console.error(errorMessage);
        process.exit(1); // Terminate on file read errors.
    }

    let parsedConfiguration;
    try {
        // Parse the file content as a JSON object.
        parsedConfiguration = JSON.parse(rawConfigurationContent);
        // Validation: Ensure the parsed result is a non-null object.
        if (typeof parsedConfiguration !== 'object' || parsedConfiguration === null) {
            throw new Error('Parsed content is not a valid JSON object.');
        }
        console.log('Application configuration loaded successfully.');
        return parsedConfiguration;
    } catch (jsonError) {
        const errorMessage = `Critical: Failed to parse configuration from '${filePath}'. Error: ${jsonError.message}`;
        console.error(errorMessage);
        process.exit(1); // Terminate on JSON parsing errors.
    }
}

/**
 * Main function to execute the application startup sequence.
 * This function orchestrates the configuration loading and service initialization.
 */
async function mainApplicationStartup() {
    console.log('Initiating core application startup sequence...');

    // Step 1: Load the application configuration.
    const applicationConfiguration = obtainApplicationSettings(settingsFileLocation);

    // Optional: Add a default setting if not provided in the config.
    // This demonstrates adding new logic/fragments.
    if (!applicationConfiguration.servicePort) {
        const defaultPort = 8080;
        applicationConfiguration.servicePort = defaultPort;
        console.log(`Info: 'servicePort' not found in config. Defaulting to ${defaultPort}.`);
    }

    // Step 2: Initialize the core application service with the loaded configuration and CLI arguments.
    try {
        // Assuming initializeService might be an async operation in a real-world scenario.
        await coreApplicationBootstrap.initializeService(applicationConfiguration, commandLineInput);
        console.log('Core application service successfully initialized and ready.');
    } catch (serviceInitError) {
        console.error(`Fatal: Failed to initialize core application service. Error: ${serviceInitError.message}`);
        // Log stack trace for detailed debugging.
        console.error(serviceInitError.stack);
        process.exit(1); // Critical error, terminate.
    }

    console.log('Application startup sequence completed.');
}

// Execute the main startup function.
mainApplicationStartup();