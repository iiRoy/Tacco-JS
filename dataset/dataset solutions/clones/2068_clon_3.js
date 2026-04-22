// This array holds a sequence of integer values that can be queried.
// It represents a specific dataset for demonstration purposes.
const sequenceDataPoints = [
    1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14,
    1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51
];

// Define the valid range for accessing elements within the sequence.
// The minimum valid position is 1 (user-facing, not zero-based).
const minimumAllowedPosition = 1;
// The maximum valid position corresponds to the last element of the array.
const maximumAllowedPosition = sequenceDataPoints.length; // This value is 32.

// Access command-line arguments via the global 'process' object.
const commandLineArguments = process.argv;

// The user-specified position is expected as the third argument (index 2).
// It needs to be converted from a string to an integer, specifying base 10.
let requestedPosition = parseInt(commandLineArguments[2], 10);

// --- Input Validation Phase ---

// First, check if the parsed value is a valid number.
if (isNaN(requestedPosition)) {
    console.warn("ERROR: The provided argument is not a valid numerical input.");
    console.info(`Usage: node <script_name> <position_number> (e.g., node script.js 5)`);
}
// Next, verify if the position falls within the acceptable bounds.
else if (requestedPosition < minimumAllowedPosition || requestedPosition > maximumAllowedPosition) {
    console.warn(`NOTICE: The specified position (${requestedPosition}) is outside the valid range for this dataset.`);
    console.info(`Please provide a number between ${minimumAllowedPosition} and ${maximumAllowedPosition} (inclusive) to retrieve a value.`);
}
// If all input checks pass, proceed to retrieve and display the data.
else {
    // Adjust the user-provided 1-based index to a 0-based array index
    // for correct access within JavaScript's array structure.
    const effectiveArrayIndex = requestedPosition - 1;

    // Retrieve the corresponding data point from the sequence using the calculated index.
    const retrievedValue = sequenceDataPoints[effectiveArrayIndex];

    // Output the result using a more descriptive message, including both
    // the user-facing position and the internal array index.
    console.log(`Value found at user-position ${requestedPosition} (internal array index ${effectiveArrayIndex}): ${retrievedValue}`);
}

// End of script execution.