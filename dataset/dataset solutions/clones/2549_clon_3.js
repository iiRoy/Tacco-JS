// Define constants for various weather states to improve readability and maintainability.
const CLIMATE_STATE_SUNNY = 'Sunny';
const CLIMATE_STATE_CLOUDY = 'Cloudy';
const CLIMATE_STATE_RAINY = 'Rainy';
const CLIMATE_STATE_UNKNOWN = 'Unrecognized'; // Renamed from 'Other' for improved semantic clarity.

// A utility object to encapsulate configuration for output messages and log levels.
const APPLICATION_MESSAGES = {
    invalidInput: "Error: Input condition must be a non-empty string for valid processing.",
    unrecognizedState: "Outcome for an unrecognized climate state determined.",
    processingComplete: "Environmental state prediction cycle finished.",
    dataAcquisitionSuccess: "Successfully acquired data from source.",
    dataAcquisitionFailure: "Failed to read from input source. Utilizing fallback data.",
    finalPrediction: "The next predicted environmental state is:"
};

// Enum-like object for log levels
const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    RESULT: 'RESULT'
};

/**
 * Generates a formatted timestamp string for logging purposes.
 * This helper ensures consistent time reporting across all log messages.
 * @returns {string} Current timestamp in a readable ISO 8601 format.
 */
const generateCurrentTimestamp = () => {
    const now = new Date();
    return `[${now.toISOString()}]`;
};

/**
 * A custom logging function designed to prepend a timestamp and a log level to messages.
 * This enhances observability and debugging capabilities.
 * @param {string} messageContent - The primary message string to be logged.
 * @param {string} [logLevel=LOG_LEVELS.INFO] - The severity level of the log message (e.g., 'INFO', 'WARN', 'ERROR').
 */
const applicationLog = (messageContent, logLevel = LOG_LEVELS.INFO) => {
    console.log(`${generateCurrentTimestamp()} [${logLevel}] ${messageContent}`);
};

/**
 * Computes the subsequent expected atmospheric state based on the provided current state.
 * This function models a simple, sequential weather progression cycle.
 * @param {string | null | undefined} currentAtmosphericState - The current state of the atmosphere (e.g., 'Sunny', 'Cloudy').
 * @returns {string} The predicted next state or a default 'Unrecognized' state if input is invalid.
 */
function determineSubsequentAtmosphericPhase(currentAtmosphericState) {
    // Input validation: ensure the state is a valid non-empty string.
    // This guard clause prevents unexpected behavior from malformed inputs.
    if (typeof currentAtmosphericState !== 'string' || currentAtmosphericState.trim() === '') {
        applicationLog(APPLICATION_MESSAGES.invalidInput, LOG_LEVELS.ERROR);
        return CLIMATE_STATE_UNKNOWN; // Return a default outcome for invalid input.
    }

    // Normalize the input string for case-insensitive comparison and consistency.
    const standardizedState = currentAtmosphericState.trim();

    // Utilizing a Map for a more dynamic and scalable way to define state transitions.
    // This replaces a traditional switch-case or if-else if chain, offering better maintainability.
    const stateTransitionMap = new Map([
        [CLIMATE_STATE_SUNNY, CLIMATE_STATE_CLOUDY],
        [CLIMATE_STATE_CLOUDY, CLIMATE_STATE_RAINY],
        [CLIMATE_STATE_RAINY, CLIMATE_STATE_SUNNY]
    ]);

    // Retrieve the predicted next state from the map.
    // If no direct match is found, fall back to the 'Unrecognized' state.
    const predictedState = stateTransitionMap.get(standardizedState) || CLIMATE_STATE_UNKNOWN;

    // Return the determined next state. The actual logging of this outcome will occur at the caller site.
    return predictedState;
}

/**
 * Manages the application's primary execution flow, encompassing external data acquisition
 * and orchestration of the weather state prediction logic. This serves as the main entry point
 * for the core business logic.
 * @param {string} dataInputSourcePath - A string representing the file path for input data (e.g., '/dev/stdin').
 */
const orchestrateCoreApplicationLogic = (dataInputSourcePath) => {
    // Declare a variable to hold the content read from the external source.
    let externalDataSourceContent = '';

    try {
        // Dynamically import the 'fs' module, explicitly using 'node:fs' for Node.js environments.
        // This demonstrates a modern way to access built-in modules.
        const fileSystemModule = require('node:fs');

        // Read the entire file synchronously. This operation can be resource-intensive
        // and is wrapped in a try-catch block for robust error handling during file system interactions.
        externalDataSourceContent = fileSystemModule.readFileSync(dataInputSourcePath, { encoding: 'utf8', flag: 'r' });

        applicationLog(`${APPLICATION_MESSAGES.dataAcquisitionSuccess} (Path: ${dataInputSourcePath})`, LOG_LEVELS.INFO);
    } catch (ioError) {
        // If file reading fails, log a warning and provide a default fallback input.
        // This Type III change ensures the application can proceed even with input issues.
        applicationLog(`${APPLICATION_MESSAGES.dataAcquisitionFailure} Error: ${ioError.message}`, LOG_LEVELS.WARN);
        externalDataSourceContent = CLIMATE_STATE_CLOUDY; // Fallback to a known state to prevent crashes.
    }

    // Extract the first meaningful line from the input content.
    // This assumes the input contains line-separated data and we only care about the first relevant piece.
    const initialConditionFromInput = externalDataSourceContent.toString().split('\n')[0].trim();

    // Determine the next climate state using the core logic function.
    const finalPredictedOutcome = determineSubsequentAtmosphericPhase(initialConditionFromInput);

    // Log the final prediction using the custom logger.
    applicationLog(`${APPLICATION_MESSAGES.finalPrediction} ${finalPredictedOutcome}`, LOG_LEVELS.RESULT);

    // Add a small, non-essential delay to simulate background processing or asynchronous tasks.
    // This is an additional fragment for Type III, demonstrating a more complex application flow.
    setTimeout(() => {
        applicationLog(APPLICATION_MESSAGES.processingComplete, LOG_LEVELS.INFO);
    }, 75); // A slight delay for demonstration purposes.
};

// --- Application Entry Point ---
// This is the primary invocation point where the program execution officially begins.
// The default standard input path for Unix-like systems is utilized to fetch initial data.
orchestrateCoreApplicationLogic('/dev/stdin');