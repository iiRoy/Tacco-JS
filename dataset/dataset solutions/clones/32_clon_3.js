const INITIAL_CAPITAL_VALUE = 100;
const COMPOUNDING_RATE_FACTOR = 1.05; // Represents a 5% increase per period.
const FINAL_OUTPUT_MAGNIFIER = 1000; // Multiplier for the ultimate displayed result.

/**
 * Fetches and parses an integer value from a specified file path.
 * Includes error handling and ensures a non-negative integer is returned.
 * @param {string} inputFilePath - The path to the file containing the input.
 * @param {string} characterEncoding - The encoding format for reading the file (e.g., 'utf8').
 * @returns {number} The parsed non-negative integer, or 0 if parsing fails or input is invalid.
 */
function retrieveAndValidateCycleCount(inputFilePath, characterEncoding) {
    const fileSystemModule = require('fs'); // Standard Node.js file system interface.
    let rawContentBuffer;

    try {
        // Attempt to synchronously read the entire file content.
        rawContentBuffer = fileSystemModule.readFileSync(inputFilePath, characterEncoding);
    } catch (readOperationError) {
        // Log an error if the file cannot be read and terminate the process.
        console.error("An error occurred while accessing input file:", readOperationError.message);
        process.exit(1); // Exit with a non-zero status to indicate failure.
    }

    // Convert the buffer to a string, remove leading/trailing whitespace, then parse.
    const numericValue = parseInt(rawContentBuffer.toString().trim(), 10);

    // Check if the parsing operation resulted in a valid number.
    if (isNaN(numericValue)) {
        console.error("Input data is not a valid numerical sequence. Defaulting to zero cycles.");
        return 0; // Return zero cycles for invalid input.
    }

    // Ensure the number of cycles is not negative.
    return Math.max(0, numericValue);
}

/**
 * Calculates the final value after applying a compound growth rate over multiple periods.
 * Each intermediate calculation is rounded up to the nearest whole unit.
 * @param {number} startingPrincipal - The initial amount before any growth.
 * @param {number} growthFactor - The multiplier applied in each period (e.g., 1.05 for 5% growth).
 * @param {number} totalPeriods - The number of times the growth factor is applied.
 * @returns {number} The final calculated amount after compounding.
 */
function executeCompoundingCalculation(startingPrincipal, growthFactor, totalPeriods) {
    let currentComputedValue = startingPrincipal; // This variable will accumulate the growth.

    // Loop through each period to apply the compounding effect.
    for (let periodCounter = 0; periodCounter < totalPeriods; periodCounter++) {
        // Calculate the value before rounding for the current period.
        let temporaryCalculatedValue = currentComputedValue * growthFactor;
        // Apply the ceiling function to round up the result.
        currentComputedValue = Math.ceil(temporaryCalculatedValue);
    }

    return currentComputedValue; // Return the final accumulated value.
}

// --- Main Program Execution Flow ---

// Define the standard input stream path and its expected encoding.
const STDIN_PATH = '/dev/stdin';
const INPUT_ENCODING = 'utf8';

// Obtain the number of simulation cycles from the standard input.
const numberOfSimulationCycles = retrieveAndValidateCycleCount(STDIN_PATH, INPUT_ENCODING);

// Perform the primary calculation using the defined parameters and input cycles.
const finalCalculatedSum = executeCompoundingCalculation(
    INITIAL_CAPITAL_VALUE,
    COMPOUNDING_RATE_FACTOR,
    numberOfSimulationCycles
);

// Apply the final scaling factor for presentation purposes.
const formattedOutputResult = finalCalculatedSum * FINAL_OUTPUT_MAGNIFIER;

// Display the comprehensive result to the console.
console.log("The adjusted final simulated value is:", formattedOutputResult);