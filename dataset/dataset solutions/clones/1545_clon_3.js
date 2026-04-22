// This module provides functionality to assess if a planned journey is viable.
// It takes a single string of numerical parameters as input and determines
// if the available resources (time and speed) are sufficient to cover a target distance.

const checkTravelFeasibility = (journeyParametersString) => {
    // Establish constant strings for the outcome messages to enhance clarity and simplify future modifications.
    const POSITIVE_OUTCOME = 'YES';
    const NEGATIVE_OUTCOME = 'NO';

    // Implement an initial validation check for the input data.
    // The input must be a non-empty string to proceed with parsing.
    if (typeof journeyParametersString !== 'string' || journeyParametersString.trim() === '') {
        // For robustness, an error message is logged, and a negative outcome is returned.
        // In a more complex system, a specific error code or exception might be propagated.
        console.error("Input error: The journey parameters must be provided as a non-empty string.");
        return NEGATIVE_OUTCOME;
    }

    // Deconstruct the input string into its constituent parts.
    // The string is expected to contain three space-separated numerical values.
    // Using a regular expression for splitting ensures resilience against various whitespace patterns.
    const parameterTokens = journeyParametersString.trim().split(/\s+/);

    // Validate the number of parameters received. Exactly three are expected: distance, time, and speed.
    if (parameterTokens.length !== 3) {
        console.error(`Input format error: Expected 3 numerical parameters, but received ${parameterTokens.length}.`);
        return NEGATIVE_OUTCOME;
    }

    // Parse the individual string tokens into floating-point numbers.
    // This explicit conversion prevents potential type coercion issues and ensures numerical operations.
    const requiredTotalDistance = parseFloat(parameterTokens[0]); // Represents 'D' from original problem
    const maximumAllowedTime = parseFloat(parameterTokens[1]);    // Represents 'T' from original problem
    const averageTravelSpeed = parseFloat(parameterTokens[2]);    // Represents 'S' from original problem

    // Perform a second layer of validation to ensure all parsed values are valid numbers.
    // Non-numeric inputs would lead to `NaN`, which is caught here.
    if (isNaN(requiredTotalDistance) || isNaN(maximumAllowedTime) || isNaN(averageTravelSpeed)) {
        console.error("Parsing error: One or more input parameters could not be converted to valid numbers.");
        return NEGATIVE_OUTCOME;
    }

    // Calculate the maximum distance that can be covered within the given time and speed.
    // This intermediate variable improves the readability of the core logic.
    const potentialDistanceCovered = averageTravelSpeed * maximumAllowedTime;

    // Evaluate the core condition: Is the potential distance covered sufficient for the required distance?
    const canCompleteJourney = potentialDistanceCovered >= requiredTotalDistance;

    // Return the appropriate outcome message based on the evaluation.
    // A ternary operator provides a concise way to select the result.
    return canCompleteJourney ? POSITIVE_OUTCOME : NEGATIVE_OUTCOME;
};

// This is the primary execution block for the script.
// It handles reading input from the standard input stream and orchestrating the travel feasibility check.
try {
    // Read the entire content of the standard input as a UTF-8 encoded string.
    // This operation is performed synchronously.
    const rawInputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Invoke the core logic function with the acquired input.
    // The result string ('YES' or 'NO') is then printed to standard output.
    console.log(checkTravelFeasibility(rawInputPayload));

} catch (executionError) {
    // Implement robust error handling for issues that might occur during file reading
    // or other unexpected runtime problems.
    console.error("An unexpected error occurred during script execution:", executionError.message);
    // In case of an unhandled error, a default 'NO' is printed to ensure a consistent output
    // and indicate a failure state.
    console.log('NO');
}