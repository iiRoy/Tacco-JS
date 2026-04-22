"use strict";

/**
 * A utility function to safely read content from standard input.
 * Handles potential file system errors gracefully.
 * @returns {string} The content read from /dev/stdin, or an empty string on error.
 */
const retrieveSourceData = () => {
    try {
        // Attempt to read the entire file synchronously
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (issue) {
        // Log an error if reading fails, but allow the program to continue with empty data.
        console.error("Failed to access /dev/stdin for input:", issue.message);
        return ""; // Provide a default empty string to prevent further errors
    }
};

/**
 * The primary routine responsible for processing the input data and performing calculations.
 * This function encapsulates the main business logic.
 * @param {string} incomingPayload - The raw string data received from the input source.
 */
const processInputAndComputeOutcome = (incomingPayload) => {
    // --- Configuration Constants ---
    const MINUTES_PER_HOUR_CONSTANT = 60; // Standard minutes in one hour.
    // This threshold value (3600 minutes) is central to the original logic's time wrap-around calculation.
    // It's equivalent to 60 hours, suggesting a non-standard cycle or a specific problem domain.
    const ARBITRARY_TIME_BOUNDARY_MINUTES = 3600;
    const REQUIRED_NUM_PARAMETERS = 5; // Expecting 5 numeric values on the first line.

    // --- Input Validation and Pre-processing ---
    // Check if the input payload is valid before proceeding.
    if (!incomingPayload || incomingPayload.trim().length === 0) {
        console.warn("Input payload is empty or contains only whitespace. No operation performed.");
        return; // Terminate execution for invalid input.
    }

    // Divide the input payload into an array of individual text lines.
    let inputSegments = incomingPayload.split('\n');

    // Ensure there's at least one line to process for configuration.
    if (inputSegments.length === 0) {
        console.warn("No distinct lines found in the input. Cannot extract configuration.");
        return;
    }

    // Extract and parse the primary configuration line (the first line).
    // This involves several steps:
    // 1. Get the first line and remove it from the array.
    // 2. Remove any leading/trailing whitespace.
    // 3. Split the line by spaces into an array of string tokens.
    // 4. Filter out any empty string tokens that might result from multiple spaces.
    // 5. Map each string token to a number, handling potential non-numeric values.
    let numericConfigurationParameters = inputSegments.shift()
                                                .trim()
                                                .split(' ')
                                                .filter(item => item !== '')
                                                .map(strValue => {
                                                    const parsedNumericalValue = Number(strValue);
                                                    if (isNaN(parsedNumericalValue)) {
                                                        console.error(`Encountered non-numeric input: "${strValue}". Substituting with 0.`);
                                                        return 0; // Default to 0 for invalid numbers to prevent NaN propagation.
                                                    }
                                                    return parsedNumericalValue;
                                                });

    // --- Parameter Validation ---
    // Verify that the expected number of parameters were successfully parsed.
    if (numericConfigurationParameters.length < REQUIRED_NUM_PARAMETERS) {
        console.error(`Insufficient parameters detected on the first line. Expected ${REQUIRED_NUM_PARAMETERS}, but found ${numericConfigurationParameters.length}.`);
        // Depending on requirements, could throw error, pad with zeros, or use default values.
        // For this clone, we'll proceed with available data, which might lead to `undefined` in calculations.
    }

    // --- Data Extraction and Initial Calculations ---
    // Assign the parsed numeric values to descriptive variables.
    // Original indices: [0] = H1, [1] = M1, [2] = H2, [3] = M2, [4] = K
    const initialHourComponent = numericConfigurationParameters[0];
    const initialMinuteComponent = numericConfigurationParameters[1];
    const finalHourComponent = numericConfigurationParameters[2];
    const finalMinuteComponent = numericConfigurationParameters[3];
    const adjustmentValue = numericConfigurationParameters[4]; // This corresponds to 'K'

    // Calculate the absolute time in minutes from a daily start (00:00) for the initial point.
    // Equivalent to original: H1 * 60 + M1
    let absoluteStartTimestampInMinutes = (initialHourComponent * MINUTES_PER_HOUR_CONSTANT) + initialMinuteComponent;

    // Calculate the absolute time in minutes from a daily start (00:00) for the final point.
    // Equivalent to original: H2 * 60 + M2
    let absoluteEndTimestampInMinutes = (finalHourComponent * MINUTES_PER_HOUR_CONSTANT) + finalMinuteComponent;

    // A temporary variable to store the calculated time difference before final adjustment.
    let intermediateTimeDifference;

    // --- Conditional Logic for Time Difference Calculation ---
    // The core decision point based on the relative order of start and end times.
    if (absoluteStartTimestampInMinutes < absoluteEndTimestampInMinutes) {
        // Scenario 1: The end time occurs later on the "same day" (within the 0-ARBITRARY_TIME_BOUNDARY_MINUTES cycle).
        intermediateTimeDifference = absoluteEndTimestampInMinutes - absoluteStartTimestampInMinutes;
    } else {
        // Scenario 2: The end time is numerically smaller, implying it occurs on a "subsequent day"
        // or after the ARBITRARY_TIME_BOUNDARY_MINUTES has been crossed.
        // This calculation uses the specific ARBITRARY_TIME_BOUNDARY_MINUTES value from the original code.
        let durationUntilBoundary = ARBITRARY_TIME_BOUNDARY_MINUTES - absoluteStartTimestampInMinutes;
        intermediateTimeDifference = absoluteEndTimestampInMinutes + durationUntilBoundary;
    }

    // --- Final Adjustment and Output ---
    // Subtract the 'K' value (adjustmentValue) from the computed time difference.
    const finalCalculatedResult = intermediateTimeDifference - adjustmentValue;

    // Display the final outcome to the standard output.
    console.log(finalCalculatedResult);
};

// --- Execution Entry Point ---
// Invoke the main processing function with data obtained from standard input.
processInputAndComputeOutcome(retrieveSourceData());