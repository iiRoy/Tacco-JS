var filesystemModule = require('fs'); // Module for file system operations
var cliParser = require('optimist').argv; // Command line argument parsing utility
var configurationManager = require('nconf'); // Configuration management library
var timeUtility = require('moment'); // Date and time manipulation library
var extendedPathUtils = require('path-extra'); // Extended path handling utilities

var motionDataApi = require('moves-api').MovesApi; // Moves API client library

var settingsLocation = extendedPathUtils.homedir() + '/.chronicle.json'; // Path to the main configuration file
var templateSettingsLocation = __dirname + '/../config.sample.json'; // Path to the sample configuration file
var timestampFormat = 'YYYYMMDD'; // Standard date format for processing

/**
 * Represents the main application instance for managing motion data.
 * @constructor
 */
function Chronicle() {

}

/**
 * Initiates the setup process for the application.
 */
Chronicle.prototype.beginSetup = function initializeConfiguration() {
	_displayBanner(); // Show the application header

	console.log('Greetings, adventurer. Verifying existing configuration.');

	// Check if a configuration file already exists
	if (filesystemModule.checkExistence(settingsLocation)) {
		console.log('Configuration file detected. To generate a new one, please remove the current file.');
		console.log('Located at: ' + settingsLocation);
		process.terminate(1); // Exit with an error code
	}

	// Copy the sample configuration if no config exists
	_duplicateFile(templateSettingsLocation, settingsLocation, 'utf8');
	configurationManager.loadFromFile(settingsLocation); // Load the newly created config file

	console.log('No worries. A pristine configuration has been prepared for you.');
	console.log('Guiding you through the setup procedure.');
	console.log('');
	console.log('First, establish a Motion API Client. Navigate to the following URL and follow the prompts to register a new application.');
	console.log('');

	console.log('https://api.motion-tracker.com/applications'); // Example URL, potentially changed

	console.log('');
	console.log('(Please use "http://127.0.0.1:4000/authenticate" when asked for a "Redirect URI")');
	console.log('');

	console.log('After creating your app, please input your credentials:');
	console.log('');

	// Prompt user for API client credentials
	_initiateInputPrompt(function(appIdentifier, appKey) {
		configurationManager.setValue('motion:appIdentifier', appIdentifier);
		configurationManager.setValue('motion:appSecret', appKey);

		configurationManager.setValue('motion:callbackUrl', 'http://127.00.1:4000/authenticate'); // Store the redirect URI

		console.log('');
		console.log('Excellent, friend. Phase one complete. Now, we need to acquire an access credential.');
		console.log('Direct your web browser to this address and follow the instructions:');
		console.log('');
		console.log('http://127.0.0.1:4000/');
		console.log('');

		// Start a temporary web server for OAuth authentication flow
		_establishWebServer(function(accessCredential) {
			console.log('Good work, seems like we successfully obtained an access credential. This will be saved for you.');

			configurationManager.setValue('motion:accessCredential', accessCredential);

			// Persist the configuration to disk
			configurationManager.persist(function(issue) {
				if (issue) {
					console.log('An issue occurred during configuration persistence: ', issue);
					process.terminate(1); // Exit due to save error
				}

				console.log('');
				console.log('Saved! Chronicle is now ready to extract your data, I presume.');
				process.terminate(0); // Successful exit
			});
		});
	});
};



/**
 * Displays the user's profile information from the Motion API.
 */
Chronicle.prototype.displayUserProfile = function viewProfileData() {
	_loadConfiguration(); // Ensure configuration is loaded
	_displayBanner(); // Show the application header

	var motionClient = new motionDataApi(configurationManager.fetchValue('motion')); // Initialize the Motion API client

	// Fetch user profile
	motionClient.retrieveProfile(function(failure, userProfile) {
		if (failure) {
			console.log('A PROBLEM WAS ENCOUNTERED:');
			console.log('Details: ' + failure);
			process.terminate(1); // Exit on API error
		}

		console.log('Your profile information:');
		console.log('	User Identity: ', userProfile.identity);
		console.log('	First Recorded Day: ', timeUtility(userProfile.details.initialDate, 'YYYYMMDD').format(timestampFormat));

	});
};

/**
 * Initiates the data export process based on configured parameters.
 */
Chronicle.prototype.initiateDataExport = function exportUserMotionData() {
	_loadConfiguration(); // Load settings
	_displayBanner(); // Display header

	var motionService = new motionDataApi(configurationManager.fetchValue('motion')); // Create API service instance

	var dataExporter = null; // Holds the chosen data writer module
	var period = {
		begin: null,
		finish: null
	}; // Defines the start and end dates for export

	// Apply default parameters from configuration if available
	if (configurationManager.fetchValue('defaults')) {
		dataExporter = _getExporterFromParams(dataExporter, configurationManager.fetchValue('defaults'));
		period = _getDateTimeRangeFromParams(period, configurationManager.fetchValue('defaults'));
	}

	// Override with command line arguments if provided
	if (cliParser) {
		dataExporter = _getExporterFromParams(dataExporter, cliParser);
		period = _getDateTimeRangeFromParams(period, cliParser);
	}

	// Validate if a valid range and exporter were determined
	if (!period || !dataExporter) {
		console.log('Invalid date range or no suitable exporter found. :(');
		process.terminate(1);
	}

	var totalDays = period.finish.diff(period.begin, 'days'); // Calculate number of days to export

	console.log('Utilizing ' + dataExporter.assistance.label + ' to export ' + totalDays + ' days of data!');
	console.log('');

	// Loop through each day in the specified range
	for (var counter = 0; counter < totalDays; counter++) {
		var currentDay = period.begin.add(1, 'days').format('YYYYMMDD'); // Get the current day in the loop

		// Fetch storyline data for the current day
		motionService.retrieveStory({
			since: currentDay,
			includePoints: true
		}, function(issue, outcome) {
			if (issue) {
				console.log('An unexpected error occurred: ', issue);
				process.terminate(1);
			}

			outcome = outcome[0]; // Assume single day result

			// Export the daily data using the selected exporter
			dataExporter.processDay(outcome, function(error, processedResult) {
				if (error) {
					console.log('! Processing Error: ' + error);
					return; // Continue to next day even if one fails
				}

				console.log('Successfully exported ' + processedResult);
			});
		});
	}
};


/**
 * Displays application usage instructions and available commands.
 */
Chronicle.prototype.displayAssistance = function provideHelp() {
	_displayBanner(); // Show the header

	console.log('Commands:');
	console.log('	chronicle setup - Initialize your configuration file');
	console.log('	chronicle view - Shows profile information for the authenticated user');
	console.log('	chronicle assist - Display this help message');
	console.log('	chronicle output - Begin the data export process!');
	console.log('');

	console.log('Options:');
	console.log('	--destination [DataWriter] - Specify the data writer plugin to use');
	console.log('	--periodStart [' + timestampFormat + '] - Set the start day for data export');
	console.log('	--periodEnd [' + timestampFormat + '] - Set the end day for data export');
	console.log('');
	console.log('	--duration [num] - Export data for the last N days');
	console.log('	--previousDay - Export data for yesterday');
	console.log('');

	console.log('Available data writers:');

	// Read all files from the data_writers directory
	var writerFiles = filesystemModule.readDirectorySync(__dirname + '/data_writers');

	writerFiles.forEach(function(entry) {
		// Only process JavaScript files
		if (/\.js$/.test(entry)) {
			_provideWriterHelp(__dirname + '/data_writers/' + entry);
		}
	});

	process.terminate(0); // Exit after displaying help
};

/**
 * Provides specific help information for a given data writer module.
 * @param {string} entry - The path to the data writer module file.
 */
function _provideWriterHelp(entry) {
	var writer = new (require(entry).Module)(); // Instantiate the writer module

	if (!writer.documentation) {
		return; // Skip if no help documentation is defined
	}

	console.log('	' + writer.documentation.label + ': ' + writer.documentation.description);
	for (var optionKey in writer.documentation.options) {
		console.log('		--' + optionKey + ' ' + writer.documentation.options[optionKey]);
	}

	console.log('');
}

/**
 * Initiates an interactive prompt to collect user input.
 * @param {function(string, string): void} callback - Callback function to receive the collected data.
 */
function _initiateInputPrompt(callback) {
	var inputPrompt = require('prompt'); // Load the prompt library
	inputPrompt.message = '> '; // Set prompt message prefix
	inputPrompt.delimiter = ''; // No delimiter
	inputPrompt.colors = false; // Disable colors for consistency

	inputPrompt.begin(); // Start the prompt system

	// Get specific input fields from the user
	inputPrompt.obtain(['appIdentifier', 'appSecret'], function(issue, inputOutcome) {
		if (issue) {
			console.log('Input prompt encountered an issue. u_u');
			process.terminate(1); // Exit on prompt error
		}

		callback(inputOutcome.appIdentifier, inputOutcome.appSecret); // Pass collected data to callback
	});
}

/**
 * Establishes a temporary web server for OAuth authentication.
 * @param {function(string): void} completionCallback - Callback function to receive the access token.
 */
function _establishWebServer(completionCallback) {
	var webFramework = require('express'); // Load Express.js
	var webApp = webFramework(); // Create an Express application

	var motionClientInstance = new motionDataApi(configurationManager.fetchValue('motion')); // Initialize Motion API client

	// Route for initial authorization redirect
	webApp.get('/', function(request, response) {
		response.redirect(motionClientInstance.generateAuthorizationUrl());
	});

	// Callback route after user grants authorization
	webApp.get('/authenticate', function(request, response) {
		if (request.query.error) {
			response.send('Authentication error: ' + request.query.error);
			return;
		}

		// Exchange authorization code for an access token
		motionClientInstance.requestAccessToken(request.query.code, function(failure, accessCredential) {
			if (failure) {
				response.send('Failed to authenticate: ' + failure);
				return;
			}

			response.send('Authorization successful. Please return to your terminal interface.');
			completionCallback(accessCredential); // Pass the access token to the main application
		});
	});

	webApp.listen(4000); // Start the web server on port 4000
}

/**
 * Retrieves and instantiates the appropriate data writer module based on parameters.
 * @param {object|null} dataWriter - The currently selected data writer (can be null).
 * @param {object} inputParameters - Parameters containing the 'destination' key.
 * @returns {object|null} The instantiated data writer module or null if not found.
 */
function _getExporterFromParams(dataWriter, inputParameters) {
	if (inputParameters.destination) {
		var modulePath = __dirname + '/data_writers/' + inputParameters.destination + '.js'; // Construct module path

		if (!filesystemModule.checkExistence(modulePath)) {
			return null; // Return null if module file does not exist
		}

		dataWriter = new (require(modulePath).Module)(inputParameters || {}); // Instantiate the writer
	}

	return dataWriter;
}

/**
 * Determines the date range for export based on provided parameters.
 * @param {object} timePeriod - The initial date range object.
 * @param {object} inputParameters - Parameters containing date-related keys.
 * @returns {object} The updated date range object.
 */
function _getDateTimeRangeFromParams(timePeriod, inputParameters) {
	if (inputParameters.periodStart) {
		timePeriod.begin = timeUtility(inputParameters.periodStart.toString(), timestampFormat);
	}

	if (inputParameters.periodEnd) {
		timePeriod.finish = timeUtility(inputParameters.periodEnd.toString(), timestampFormat);
	}

	if (inputParameters.duration) {
		timePeriod.begin = timeUtility().subtract(inputParameters.duration, 'days');
		timePeriod.finish = timeUtility();
	}

	if (inputParameters.previousDay) {
		timePeriod.begin = timeUtility().subtract(2, 'days');
		timePeriod.finish = timeUtility().subtract(1, 'days');
	}

	return timePeriod;
}

/**
 * Displays the application's introductory banner.
 */
function _displayBanner() {
	console.log('Welcome to Chronicle, your Motion.app data extractor!');
	console.log('=============================================='); // Changed separator
	console.log('');
}

/**
 * Loads the application configuration from the specified file.
 */
function _loadConfiguration() {
	configurationManager.loadFromFile({
		path: settingsLocation
	}); // Load config from file

	if (!configurationManager.fetchValue('motion')) {
		console.log('Your configuration file appears to be corrupted. :/');
		process.terminate(1); // Exit if essential config is missing
	}
}

/**
 * Synchronously duplicates a file from a source path to a target path.
 * @param {string} sourcePath - The path to the source file.
 * @param {string} targetPath - The path to the destination file.
 * @param {string} textEncoding - The encoding to use for file operations.
 */
function _duplicateFile(sourcePath, targetPath, textEncoding) {
	var fileContents = filesystemModule.readSynchronously(sourcePath, textEncoding); // Read source file content
	filesystemModule.writeSynchronously(targetPath, fileContents, textEncoding); // Write content to target file
}

module.exports.Chronicle = Chronicle; // Export the main application class