// This module is designed to process an initial atmospheric state and
// determine its probable subsequent condition based on a predefined transition model.
// It includes robust input handling and error reporting mechanisms.

/**
 * Ascertains the next likely atmospheric state given the current observed condition.
 * This function processes the input, applies a set of predefined weather transitions,
 * and outputs the predicted next state to the console.
 *
 * @param {string} currentObservedCondition - The string representing the current weather state (e.g., 'Sunny', 'Cloudy', 'Rainy').
 * @returns {string} The predicted next weather state, or 'Unpredictable' if the input is not recognized.
 */
function evaluateNextWeatherState(currentObservedCondition) {
    // Declare a local variable to store the outcome of the prediction.
    let predictedOutcome;

    // Step 1: Normalize the input string. This involves converting it to a string type
    // and removing any leading or trailing whitespace characters.
    // This is an added intermediate processing step for robustness (Type III addition).
    const normalizedCondition = String(currentObservedCondition).trim();

    // Step 2: Implement the core state transition logic.
    // Instead of a simple object lookup, a 'switch' statement is utilized for mapping
    // the current state to its subsequent state. This represents a significant
    // structural rewrite of the original logic (Type III update/rewrite).
    switch (normalizedCondition) {
        case 'Sunny':
            // If the current state is Sunny, the next predicted state is Cloudy.
            predictedOutcome = 'Cloudy';
            break;
        case 'Cloudy':
            // If the current state is Cloudy, the next predicted state is Rainy.
            predictedOutcome = 'Rainy';
            break;
        case 'Rainy':
            // If the current state is Rainy, the next predicted state is Sunny.
            predictedOutcome = 'Sunny';
            break;
        default:
            // Step 3: Handle unexpected or invalid input conditions.
            // This 'default' case acts as a guard clause and validation mechanism.
            // It logs an error message and assigns a specific 'Unpredictable' state.
            // This is a new fragment (Type III addition).
            console.error(`ATTENTION: An unrecognized atmospheric condition was supplied: '${normalizedCondition}'. Cannot derive a reliable forecast.`);
            predictedOutcome = 'Unpredictable'; // Assign a specific fallback state.
            break;
    }

    // Step 4: Output the result.
    // The output message is more descriptive and varies based on whether a prediction
    // was successfully made or not (Type III update and addition).
    if (predictedOutcome === 'Unpredictable') {
        // Provide a specific warning for cases where prediction failed.
        console.warn("Forecast system encountered an issue and could not determine a meaningful subsequent atmospheric state.");
    } else {
        // Log the successful prediction with contextual information.
        console.log(`Forecast System Report: Based on the current observation of '${normalizedCondition}', the subsequent weather condition is projected to be: ${predictedOutcome}.`);
    }

    // The function now explicitly returns the predicted outcome,
    // which is an added fragment (Type III addition), even if the caller doesn't use it.
    return predictedOutcome;
}

// --- Main Execution Flow for Standard Input Processing ---

// Acquire the Node.js built-in 'fs' (file system) module.
// This uses a descriptive variable name (Type II rename).
const fileSystemUtility = require("fs");

// Define the standard input stream path.
// This uses a descriptive variable name (Type II rename).
const standardInputSourcePath = "/dev/stdin";

let rawInputContentFromStream; // Helper variable (Type III addition).

try {
    // Attempt to synchronously read the entire content from the standard input stream.
    // The content is decoded as UTF-8.
    rawInputContentFromStream = fileSystemUtility.readFileSync(standardInputSourcePath, "utf8");
} catch (inputReadError) {
    // Step 5: Implement error handling for input reading.
    // This try-catch block is a new fragment (Type III addition) to improve robustness.
    console.error("CRITICAL ERROR: Failed to read data from the standard input stream:", inputReadError.message);
    // In case of input reading failure, provide a default condition to prevent application crash.
    rawInputContentFromStream = "Sunny"; // Fallback value (Type III addition).
    console.warn("Proceeding with a default weather condition of 'Sunny' due to input read failure.");
}

// Step 6: Further process the acquired input data.
// Ensure the input is treated as a string and remove any extraneous whitespace.
// This is an intermediate processing step (Type III addition).
const cleanedAndTrimmedInput = String(rawInputContentFromStream).trim();

// Step 7: Add a final validation check for an empty input string.
// This is a guard clause (Type III addition).
if (cleanedAndTrimmedInput.length === 0) {
    console.warn("Input from the standard stream was detected as empty or entirely whitespace after cleaning. Utilizing a default 'Cloudy' state for processing.");
    // If input is empty, invoke the function with a predefined default value.
    evaluateNextWeatherState("Cloudy");
} else {
    // If valid, invoke the primary weather prediction function with the cleaned input.
    evaluateNextWeatherState(cleanedAndTrimmedInput);
}