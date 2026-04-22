var fileSysUtil = require('fs');
var cliArgs = require('optimist').argv;
var appConfig = require('nconf');
var timeUtils = require('moment');
var dirPath = require('path-extra');

var ActivityClient = require('moves-api').MovesApi;

// Application-wide configuration parameters and constants
const APP_NAME_IDENTIFIER = 'actx'; // Renamed from elizabeth
const CONFIG_FILE_NAME = `.${APP_NAME_IDENTIFIER}.json`;
const CONFIG_TEMPLATE_NAME = 'config.sample.json';
const DEFAULT_DATE_FORMAT = 'YYYYMMDD'; // Data format for date strings
const AUTH_REDIRECT_URI = 'http://localhost:3000/auth';
const WEB_SERVER_PORT = 3000;
const CURRENT_APP_VERSION = '1.2.3-beta';

// Path to the user's configuration file
var mainConfigPath = dirPath.homedir() + '/' + CONFIG_FILE_NAME;
// Path to the sample configuration template within the application directory
var defaultConfigTemplate = __dirname + '/../' + CONFIG_TEMPLATE_NAME;

/**
 * @class ActivityDataExporter
 * @description Core class for managing and exporting activity data from Moves API.
 */
function ActivityDataExporter() {
    // Constructor for the main application class. No specific initialization logic here.
}

/**
 * Initializes the application configuration.
 * Guides the user through creating a new configuration file and obtaining API tokens.
 * @returns {void}
 */
ActivityDataExporter.prototype.initializeConfiguration = function configurationInitializer() {
    _displayBannerMessage(); // Show the application header

    console.log(`> Welcome. Let's get your configuration set up for ${APP_NAME_IDENTIFIER}.`);

    if (fileSysUtil.existsSync(mainConfigPath) && !cliArgs.forceInit) {
        console.log(`> An existing configuration file was detected at: ${mainConfigPath}`);
        console.log('> If you wish to re-create it, please delete it first or use the --forceInit flag.');
        process.exit(1); // Exit if config exists and no forceInit flag
    } else if (fileSysUtil.existsSync(mainConfigPath) && cliArgs.forceInit) {
        console.log(`> Existing configuration found, but --forceInit flag is present. Proceeding with re-initialization.`);
        // Optionally delete the old file here if desired, but _duplicateConfigFile will overwrite.
    }

    // Ensure the sample config exists before attempting to copy
    if (!fileSysUtil.existsSync(defaultConfigTemplate)) {
        console.error(`> Error: Configuration template not found at ${defaultConfigTemplate}. Aborting initialization.`);
        process.exit(1);
    }

    // Copy the sample configuration file to the user's home directory
    _duplicateConfigFile(defaultConfigTemplate, mainConfigPath, 'UTF-8');
    appConfig.file(mainConfigPath); // Load the newly created configuration file

    console.log('> Configuration file created successfully.');
    console.log('> Now, let\'s walk through setting up your Moves API access.');
    console.log('\n> Step 1: Create a Moves API Client application.');
    console.log('> Please visit the following URL and follow the instructions to register a new application:');
    console.log('\nhttps://dev.moves-app.com/apps\n');
    console.log(`> (Important: When prompted for a "Redirect URI", use "${AUTH_REDIRECT_URI}")`);
    console.log('\n> After creating your application, please enter the Client ID and Client Secret below:');

    // Prompt the user for API credentials
    _initiateUserInput(function(appClientId, appClientSecret) {
        // Store the client credentials in the configuration
        appConfig.set('api:moves:clientId', appClientId);
        appConfig.set('api:moves:clientSecret', appClientSecret);
        appConfig.set('api:moves:redirectUri', AUTH_REDIRECT_URI);

        console.log('\n> Credentials saved. Moving to Step 2: Obtain an Access Token.');
        console.log('> Point your web browser to this URL to authorize the application:');
        console.log(`\nhttp://localhost:${WEB_SERVER_PORT}/\n`);
        console.log('> The application will automatically capture the token once authentication is complete.');

        // Start a temporary web server to handle the OAuth redirect and capture the access token
        _startAuthServer(function(authToken) {
            console.log('> Access token successfully retrieved!');
            appConfig.set('api:moves:accessToken', authToken); // Store the access token

            // Save the entire configuration to disk
            _validateAndSaveConfig(appConfig, function(saveErr) {
                if (saveErr) {
                    console.error(`> Error during configuration save: ${saveErr.message}`);
                    process.exit(1);
                }
                console.log('\n> Configuration saved! You are now ready to export your activity data.');
                process.exit(0); // Exit successfully
            });
        });
    });
};

/**
 * Fetches and displays the user's profile information from the Moves API.
 * @returns {void}
 */
ActivityDataExporter.prototype.displayUserProfile = function userProfileViewer() {
    _retrieveApplicationConfig(); // Load configuration

    _displayBannerMessage(); // Show the application header

    const activityService = new ActivityClient(appConfig.get('api:moves')); // Initialize Moves API client

    console.log('> Attempting to retrieve your profile details...');

    activityService.getProfile(function(apiErr, userProfileData) {
        if (apiErr) {
            console.error(`> API Error encountered while fetching profile: ${apiErr.message || apiErr}`);
            process.exit(1);
        }

        if (!userProfileData || !userProfileData.profile) {
            console.error('> No profile data received or data structure is unexpected.');
            process.exit(1);
        }

        const userIdentifier = userProfileData.userId;
        const initialActivityDate = timeUtils(userProfileData.profile.firstDate, DEFAULT_DATE_FORMAT).format(DEFAULT_DATE_FORMAT);
        const profileTimeZone = userProfileData.profile.timezone.id; // Example of adding a new field display

        console.log('\n> Your Moves Profile Information:');
        console.log(`  - User ID:           ${userIdentifier}`);
        console.log(`  - First Activity Day: ${initialActivityDate}`);
        console.log(`  - Time Zone:         ${profileTimeZone}`);
        console.log('\n> Profile display complete.');
    });
};

/**
 * Initiates the data export process based on command-line arguments and configuration.
 * @returns {void}
 */
ActivityDataExporter.prototype.beginDataExport = function dataExportInitiator() {
    _retrieveApplicationConfig(); // Load configuration
    _displayBannerMessage(); // Show the application header

    const activityService = new ActivityClient(appConfig.get('api:moves')); // Initialize Moves API client

    let dataExporter = null; // The selected export plugin
    let exportPeriod = { // Object to hold start and end dates for export
        start: null,
        end: null
    };

    // Apply default export parameters from configuration if available
    if (appConfig.get('defaults')) {
        dataExporter = _resolveExporterModule(dataExporter, appConfig.get('defaults'));
        exportPeriod = _determineExportPeriod(exportPeriod, appConfig.get('defaults'));
    }

    // Override with command-line arguments if provided
    if (cliArgs) {
        dataExporter = _resolveExporterModule(dataExporter, cliArgs);
        exportPeriod = _determineExportPeriod(exportPeriod, cliArgs);
    }

    // Validate the export parameters
    if (!exportPeriod.start || !exportPeriod.end || !dataExporter) {
        console.error('> Error: Invalid date range or export plugin specified. Please check your parameters.');
        console.log('> Use "ellie help" for usage instructions.');
        process.exit(1);
    }

    // Ensure start date is not after end date
    if (exportPeriod.start.isAfter(exportPeriod.end)) {
        console.error('> Error: The start date cannot be after the end date. Please adjust your date parameters.');
        process.exit(1);
    }

    const totalDaysToProcess = exportPeriod.end.diff(exportPeriod.start, 'days') + 1; // Inclusive day count

    console.log(`> Using exporter: "${dataExporter.help.name}" to process ${totalDaysToProcess} days.`);
    console.log(`> Export period: ${exportPeriod.start.format(DEFAULT_DATE_FORMAT)} to ${exportPeriod.end.format(DEFAULT_DATE_FORMAT)}`);
    console.log('');

    let processedDayCount = 0;
    let successfulExports = 0;
    let failedExports = 0;

    // Iterate through each day in the specified range
    for (let dayOffset = 0; dayOffset < totalDaysToProcess; dayOffset++) {
        // Create a new moment object for each day to avoid modifying the original start date
        const currentDayMoment = timeUtils(exportPeriod.start).add(dayOffset, 'days');
        const currentDayString = currentDayMoment.format('YYYYMMDD');

        console.log(`> Fetching storyline for: ${currentDayString}...`);

        // Fetch storyline data for the current day
        activityService.getStoryline({
            from: currentDayString,
            trackPoints: true
        }, function(apiErr, apiResult) {
            processedDayCount++; // Increment counter for processed API calls

            if (apiErr) {
                console.error(`> API Error for ${currentDayString}: ${apiErr.message || apiErr}`);
                failedExports++;
                // Decide whether to continue or exit on error. For now, continue but log error.
                if (processedDayCount === totalDaysToProcess) {
                    _finalizeExportSummary(successfulExports, failedExports);
                }
                return;
            }

            // Moves API returns an array, we usually expect the first element
            const dailyData = apiResult && apiResult.length > 0 ? apiResult[0] : null;

            if (!dailyData) {
                console.warn(`> No storyline data found for ${currentDayString}. Skipping export for this day.`);
                failedExports++;
                if (processedDayCount === totalDaysToProcess) {
                    _finalizeExportSummary(successfulExports, failedExports);
                }
                return;
            }

            // Export the daily data using the selected plugin
            dataExporter.exportDay(dailyData, function(exportErr, exportOperationResult) {
                if (exportErr) {
                    console.error(`! Export Error for ${currentDayString}: ${exportErr.message || exportErr}`);
                    failedExports++;
                } else {
                    console.log(`> Successfully exported data for ${currentDayString}: ${exportOperationResult}`);
                    successfulExports++;
                }

                // Check if all days have been processed
                if (processedDayCount === totalDaysToProcess) {
                    _finalizeExportSummary(successfulExports, failedExports);
                }
            });
        });
    }

    /**
     * Helper function to print a summary after all export operations are attempted.
     * @param {number} successCount - Number of successful exports.
     * @param {number} failureCount - Number of failed exports.
     */
    function _finalizeExportSummary(successCount, failureCount) {
        console.log('\n--- Export Process Summary ---');
        console.log(`Total days requested: ${totalDaysToProcess}`);
        console.log(`Successful exports:   ${successCount}`);
        console.log(`Failed exports:       ${failureCount}`);
        if (failureCount > 0) {
            console.log('> Some exports failed. Please review the logs above for details.');
        } else {
            console.log('> All requested data successfully exported!');
        }
        process.exit(failureCount > 0 ? 1 : 0); // Exit with error code if any export failed
    }
};

/**
 * Displays the application's command-line usage guide and available exporter plugins.
 * @returns {void}
 */
ActivityDataExporter.prototype.showUsageGuide = function applicationHelpDisplay() {
    _displayBannerMessage(); // Show the application header

    console.log(`> ${APP_NAME_IDENTIFIER} v${CURRENT_APP_VERSION} - Usage Guide\n`);

    console.log('Available Commands:');
    console.log(`  ${APP_NAME_IDENTIFIER} init   - Initialize or re-initialize your configuration file.`);
    console.log(`  ${APP_NAME_IDENTIFIER} profile- Display your linked Moves API user profile information.`);
    console.log(`  ${APP_NAME_IDENTIFIER} help   - Show this comprehensive usage guide.`);
    console.log(`  ${APP_NAME_IDENTIFIER} export - Begin the data export process using specified parameters.`);
    console.log('');

    console.log('General Options:');
    console.log(`  --output [ExporterName]   - Specify the data export plugin to use (e.g., 'json', 'csv').`);
    console.log(`  --dayStart [${DEFAULT_DATE_FORMAT}] - Set the inclusive start date for data export.`);
    console.log(`  --dayEnd [${DEFAULT_DATE_FORMAT}]   - Set the inclusive end date for data export.`);
    console.log(`  --days [n]                - Export data for the last 'n' days, ending today.`);
    console.log(`  --yesterday               - Export data specifically for yesterday.`);
    console.log(`  --forceInit               - Force configuration re-initialization, even if a file exists.`);
    console.log('');

    console.log('Configuring Exporters:');
    console.log('The following data exporters are currently available:');

    try {
        const exporterDirectory = __dirname + '/output';
        const availableExporterFiles = fileSysUtil.readdirSync(exporterDirectory);

        if (availableExporterFiles.length === 0) {
            console.log('  No exporters found in the "output" directory. Please ensure plugins are installed.');
        } else {
            availableExporterFiles.forEach(function(exporterFileName) {
                // Check if the file is a JavaScript module
                if (/\.js$/.test(exporterFileName)) {
                    _presentExporterDetails(exporterDirectory + '/' + exporterFileName);
                }
            });
        }
    } catch (error) {
        console.error(`> Error listing exporters: ${error.message}. Is the 'output' directory missing?`);
    }

    process.exit(0); // Exit after displaying help
};

/**
 * Loads an exporter module and prints its help information.
 * @param {string} exporterModulePath - The file path to the exporter module.
 * @returns {void}
 */
function _presentExporterDetails(exporterModulePath) {
    let currentExporterInstance;
    try {
        const ExporterPlugin = require(exporterModulePath).Plugin;
        if (typeof ExporterPlugin !== 'function') {
            console.warn(`> Warning: Exporter module at ${exporterModulePath} does not export a 'Plugin' constructor.`);
            return;
        }
        currentExporterInstance = new ExporterPlugin();
    } catch (loadErr) {
        console.error(`> Error loading exporter from ${exporterModulePath}: ${loadErr.message}`);
        return;
    }

    if (!currentExporterInstance || !currentExporterInstance.help) {
        console.log(`  [${exporterModulePath}] - No help documentation available.`);
        return;
    }

    console.log(`  ${currentExporterInstance.help.name}: ${currentExporterInstance.help.description}`);
    if (currentExporterInstance.help.options && Object.keys(currentExporterInstance.help.options).length > 0) {
        for (const optionKey in currentExporterInstance.help.options) {
            if (Object.prototype.hasOwnProperty.call(currentExporterInstance.help.options, optionKey)) {
                console.log(`    --${optionKey} ${currentExporterInstance.help.options[optionKey]}`);
            }
        }
    } else {
        console.log('    (No specific options for this exporter)');
    }
    console.log('');
}

/**
 * Prompts the user for input using the 'prompt' library.
 * @param {function(string, string): void} callback - Callback function receiving clientId and clientSecret.
 * @returns {void}
 */
function _initiateUserInput(callback) {
    const inputPrompt = require('prompt'); // Dynamically require prompt
    inputPrompt.message = '> ';
    inputPrompt.delimiter = '';
    inputPrompt.colors = false; // Disable colors for simpler output

    console.log('\n> Awaiting your input for API credentials...');
    inputPrompt.start(); // Start the prompt service

    const promptSchema = [{
        name: 'appClientId',
        description: 'Enter your Moves API Client ID:',
        required: true
    }, {
        name: 'appClientSecret',
        description: 'Enter your Moves API Client Secret:',
        required: true,
        hidden: true, // Hide sensitive input
        replace: '*'
    }];

    inputPrompt.get(promptSchema, function(promptErr, result) {
        if (promptErr) {
            console.error(`> Error reading input: ${promptErr.message}`);
            process.exit(1);
        }

        // Validate basic input existence
        if (!result.appClientId || !result.appClientSecret) {
            console.error('> Client ID or Client Secret cannot be empty. Please try again.');
            process.exit(1);
        }

        callback(result.appClientId, result.appClientSecret);
    });
}

/**
 * Starts a temporary Express.js server to handle the OAuth redirect flow.
 * @param {function(string): void} callback - Callback function receiving the access token.
 * @returns {void}
 */
function _startAuthServer(callback) {
    const express = require('express'); // Dynamically require express
    const webApp = express();
    let serverInstance = null; // To hold the server object for closing

    const activityService = new ActivityClient(appConfig.get('api:moves'));

    // Root route redirects to Moves API authorization URL
    webApp.get('/', function(httpRequest, httpResponse) {
        console.log('> Redirecting browser to Moves API for authorization...');
        httpResponse.redirect(activityService.generateAuthUrl());
    });

    // OAuth redirect URI handler
    webApp.get('/auth', function(httpRequest, httpResponse) {
        if (httpRequest.query.error) {
            httpResponse.status(400).send(`Authentication Error: ${httpRequest.query.error_description || httpRequest.query.error}`);
            console.error(`> Authentication failed: ${httpRequest.query.error_description || httpRequest.query.error}`);
            // Attempt to close server even on error
            if (serverInstance) serverInstance.close(() => console.log('> Web server closed.'));
            process.exit(1);
            return;
        }

        const authCode = httpRequest.query.code;
        if (!authCode) {
            httpResponse.status(400).send('Authentication Error: No authorization code received.');
            console.error('> Authentication failed: No authorization code received.');
            if (serverInstance) serverInstance.close(() => console.log('> Web server closed.'));
            process.exit(1);
            return;
        }

        console.log('> Authorization code received. Exchanging for access token...');

        activityService.getAccessToken(authCode, function(apiErr, authToken) {
            if (apiErr) {
                httpResponse.status(500).send(`Error obtaining access token: ${apiErr.message || apiErr}`);
                console.error(`> Error obtaining access token: ${apiErr.message || apiErr}`);
                if (serverInstance) serverInstance.close(() => console.log('> Web server closed.'));
                process.exit(1);
                return;
            }

            httpResponse.send('<h1>Authentication Complete!</h1><p>You can now close this browser tab and return to your terminal.</p>');
            console.log('> Access token successfully acquired.');

            // Close the temporary web server after successful authentication
            if (serverInstance) {
                serverInstance.close(() => {
                    console.log('> Temporary web server stopped.');
                    callback(authToken); // Pass the token to the main application flow
                });
            } else {
                callback(authToken); // Fallback if serverInstance wasn't set for some reason
            }
        });
    });

    serverInstance = webApp.listen(WEB_SERVER_PORT, function() {
        console.log(`> Temporary web server listening for authentication callback on port ${WEB_SERVER_PORT}.`);
    }).on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`> Error: Port ${WEB_SERVER_PORT} is already in use. Please ensure no other application is using it, or try again later.`);
        } else {
            console.error(`> Error starting authentication server: ${e.message}`);
        }
        process.exit(1);
    });
}

/**
 * Resolves and instantiates an exporter module based on provided parameters.
 * @param {object|null} currentExporter - The currently selected exporter (can be null).
 * @param {object} params - Parameters object (e.g., argv or nconf defaults) containing 'output' property.
 * @returns {object|null} An instantiated exporter plugin or null if not found/invalid.
 */
function _resolveExporterModule(currentExporter, params) {
    if (!params || !params.output) {
        return currentExporter; // No output parameter, return existing or null
    }

    const requestedExporterName = params.output.toLowerCase();
    const exporterModulePath = `${__dirname}/output/${requestedExporterName}.js`;

    if (!fileSysUtil.existsSync(exporterModulePath)) {
        console.warn(`> Warning: Export plugin "${requestedExporterName}" not found at "${exporterModulePath}".`);
        return null; // Exporter not found
    }

    try {
        // Require the module and create an instance of its Plugin class
        const ExporterPluginClass = require(exporterModulePath).Plugin;
        if (typeof ExporterPluginClass !== 'function') {
            console.error(`> Error: Module "${requestedExporterName}" does not export a valid 'Plugin' constructor.`);
            return null;
        }
        return new ExporterPluginClass(params || {}); // Pass parameters to the exporter constructor
    } catch (loadErr) {
        console.error(`> Error loading or instantiating exporter "${requestedExporterName}": ${loadErr.message}`);
        return null;
    }
}

/**
 * Determines the date range for data export based on provided parameters.
 * @param {object} currentExportPeriod - The current export period object (start, end).
 * @param {object} params - Parameters object (e.g., argv or nconf defaults) containing date options.
 * @returns {object} An updated export period object.
 */
function _determineExportPeriod(currentExportPeriod, params) {
    let newPeriod = { ...currentExportPeriod
    }; // Create a shallow copy

    if (!params) {
        return newPeriod;
    }

    // Helper to parse date strings robustly
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const parsed = timeUtils(dateString.toString(), DEFAULT_DATE_FORMAT);
        return parsed.isValid() ? parsed : null;
    };

    if (params.dayStart) {
        newPeriod.start = parseDate(params.dayStart);
        if (!newPeriod.start) {
            console.error(`> Invalid dayStart format: "${params.dayStart}". Expected ${DEFAULT_DATE_FORMAT}.`);
            process.exit(1);
        }
    }

    if (params.dayEnd) {
        newPeriod.end = parseDate(params.dayEnd);
        if (!newPeriod.end) {
            console.error(`> Invalid dayEnd format: "${params.dayEnd}". Expected ${DEFAULT_DATE_FORMAT}.`);
            process.exit(1);
        }
    }

    // 'days' takes precedence over 'dayStart'/'dayEnd' if both are present
    if (params.days) {
        const numberOfDays = parseInt(params.days, 10);
        if (isNaN(numberOfDays) || numberOfDays <= 0) {
            console.error(`> Invalid value for --days: "${params.days}". Must be a positive number.`);
            process.exit(1);
        }
        newPeriod.end = timeUtils(); // Today
        newPeriod.start = timeUtils().subtract(numberOfDays - 1, 'days'); // N days ending today, inclusive
    }

    // 'yesterday' takes precedence over 'dayStart'/'dayEnd' and 'days'
    if (params.yesterday) {
        newPeriod.end = timeUtils().subtract(1, 'days'); // Yesterday
        newPeriod.start = timeUtils().subtract(1, 'days'); // Yesterday
    }

    // If only start or end is provided, assume single day if not already set by 'days' or 'yesterday'
    if (newPeriod.start && !newPeriod.end) {
        newPeriod.end = timeUtils(newPeriod.start); // End is same as start
    } else if (newPeriod.end && !newPeriod.start) {
        newPeriod.start = timeUtils(newPeriod.end); // Start is same as end
    }

    return newPeriod;
}

/**
 * Prints a standardized header message for the application.
 * @returns {void}
 */
function _displayBannerMessage() {
    console.log(`\n--- ${APP_NAME_IDENTIFIER.toUpperCase()} Data Exporter v${CURRENT_APP_VERSION} ---`);
    console.log('------------------------------------------------');
    console.log('Your personal activity data management assistant.');
    console.log('------------------------------------------------\n');
}

/**
 * Loads the application configuration from the specified file.
 * Exits if the configuration file is missing or invalid.
 * @returns {void}
 */
function _retrieveApplicationConfig() {
    // Ensure the config file path is set before attempting to load
    if (!mainConfigPath) {
        console.error('> Configuration file path is not defined. Aborting.');
        process.exit(1);
    }

    try {
        appConfig.file({
            file: mainConfigPath
        });
        // Reloads the file if it was previously loaded, or loads it for the first time.
        // nconf automatically loads when .get() is called if not already loaded.
        // Explicitly load to catch file errors early.
        appConfig.load();
    } catch (loadError) {
        console.error(`> Error loading configuration from ${mainConfigPath}: ${loadError.message}`);
        console.error('> Please ensure the config file exists and is valid JSON. Run "ellie init" to create one.');
        process.exit(1);
    }

    // Perform a basic validation on critical configuration sections
    if (!appConfig.get('api:moves:clientId') || !appConfig.get('api:moves:clientSecret') || !appConfig.get('api:moves:accessToken')) {
        console.error(`> Your configuration file at ${mainConfigPath} appears incomplete or corrupted.`);
        console.error('> Missing essential Moves API credentials (clientId, clientSecret, or accessToken).');
        console.error('> Please run "ellie init" to re-configure the application.');
        process.exit(1);
    }
    console.log('> Application configuration successfully loaded.');
}

/**
 * Copies a file from a source path to a destination path synchronously.
 * @param {string} sourceFileLocation - The path to the source file.
 * @param {string} destinationFileLocation - The path to the destination file.
 * @param {string} fileEncoding - The encoding to use for file operations (e.g., 'UTF-8').
 * @returns {void}
 */
function _duplicateConfigFile(sourceFileLocation, destinationFileLocation, fileEncoding) {
    try {
        // Read the content of the source file
        const fileContent = fileSysUtil.readFileSync(sourceFileLocation, fileEncoding);
        // Write the content to the destination file, overwriting if it exists
        fileSysUtil.writeFileSync(destinationFileLocation, fileContent, fileEncoding);
        console.log(`> Configuration template copied from ${sourceFileLocation} to ${destinationFileLocation}`);
    } catch (copyErr) {
        console.error(`> Failed to copy configuration file: ${copyErr.message}`);
        process.exit(1); // Exit on file copy error
    }
}

/**
 * Helper function to save nconf configuration with error handling.
 * @param {object} configInstance - The nconf instance to save.
 * @param {function(Error|null): void} callback - Callback function with an error if saving fails.
 */
function _validateAndSaveConfig(configInstance, callback) {
    configInstance.save(function(saveErr) {
        if (saveErr) {
            console.error(`> Failed to persist configuration: ${saveErr.message}`);
            callback(saveErr);
        } else {
            console.log('> Configuration successfully saved to disk.');
            callback(null);
        }
    });
}

// Export the main class for external usage
module.exports = {
    ActivityDataExporter: ActivityDataExporter,
    APP_VERSION: CURRENT_APP_VERSION,
    APP_NAME: APP_NAME_IDENTIFIER
};