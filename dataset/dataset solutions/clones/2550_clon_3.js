// This module provides functionality to forecast the next atmospheric state
// based on a given initial weather condition.
function determineSubsequentClimate(climateDataArray) {
    // Check if the provided data is in an expected format.
    // A robust system should always validate its inputs.
    if (!Array.isArray(climateDataArray) || climateDataArray.length === 0) {
        console.error("ERROR: Input climate data is either missing or malformed. Expected an array.");
        // In a real application, we might throw an exception or return a specific error code.
        return "Uncertainty"; // Returning a default 'error' state
    }

    // Extract the primary weather observation from the input array.
    // We assume the first element holds the relevant string.
    const currentObservation = String(climateDataArray[0]).trim(); // Ensure it's a string and remove whitespace.

    // Define the cyclic progression of weather conditions.
    // This lookup table replaces the original switch statement,
    // offering a more data-driven approach (Type III transformation).
    const climateProgressionMap = {
        'Sunny': 'Cloudy',
        'Cloudy': 'Rainy',
        'Rainy': 'Sunny'
    };

    let predictedOutcome; // Declare a variable to store the computed next state.

    // Check if the current observation is a recognized state in our progression.
    if (Object.prototype.hasOwnProperty.call(climateProgressionMap, currentObservation)) {
        // If recognized, determine the next state from the map.
        predictedOutcome = climateProgressionMap[currentObservation];
    } else {
        // If the input observation is not recognized, log a warning and
        // default to a standard 'Cloudy' state. This is a form of
        // graceful degradation or error handling (Type III addition).
        console.warn(`WARNING: Unrecognized climate observation "${currentObservation}". Defaulting forecast to 'Cloudy'.`);
        predictedOutcome = 'Cloudy'; // A reasonable default in a cycle.
    }

    // Output the final predicted climate to the standard output.
    // Using console.log is a common standard practice in Node.js (Type II/III update).
    console.log(predictedOutcome);
}

// --- Application Entry Point & Input Handling ---
// This section handles reading from standard input and invoking the main logic.
// It is isolated to ensure the core logic is testable independently.

// Define constants for file operations to improve readability and maintainability.
const STANDARD_INPUT_SOURCE = "/dev/stdin";
const FILE_READ_ENCODING = "utf8";

try {
    // Read the entire content from the standard input synchronously.
    // This mimics how competitive programming environments often provide input.
    const rawInputContent = require("fs").readFileSync(STANDARD_INPUT_SOURCE, FILE_READ_ENCODING);

    // Prepare the input for our function. The original problem implies
    // the input is a single string, which is then accessed as input[0].
    // We create an array containing the trimmed string.
    const preparedInputForPrediction = [rawInputContent.trim()];

    // Execute the core climate prediction logic with the prepared input.
    determineSubsequentClimate(preparedInputForPrediction);
} catch (executionError) {
    // Implement robust error handling for file system operations or other runtime issues.
    console.error("FATAL ERROR: Could not process input or execute climate prediction.", executionError.message);
    // In a production system, more sophisticated error reporting would be used.
    process.exit(1); // Indicate an abnormal termination.
}