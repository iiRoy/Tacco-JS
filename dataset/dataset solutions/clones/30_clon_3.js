// This module is responsible for computing the future value of an investment
// based on a simple compounding growth model. It reads a duration from standard
// input, applies a fixed growth rate over that duration, and then scales the final result.

const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule' for clarity.

// Configuration constants for the financial calculation.
const INITIAL_INVESTMENT_AMOUNT = 100.0;     // The starting principal for the growth calculation.
const COMPOUNDING_RATE_FACTOR = 1.05;      // The multiplier applied each period (equivalent to 5% growth).
const FINAL_OUTPUT_MULTIPLIER = 1000;      // A final scaling factor applied to the computed value.
const STD_INPUT_FILE_PATH = '/dev/stdin'; // The designated path for reading input data.

/**
 * Calculates the compounded value of an initial investment over a specified number of periods.
 * The capital is rounded up after each compounding period.
 *
 * @param {number} totalCompoundingPeriods - The integer number of periods for the investment to grow.
 * @returns {number} The ultimate scaled value of the investment, or 0 if input is invalid.
 */
function determineFutureInvestmentValue(totalCompoundingPeriods) {
    // Comprehensive input validation for the number of compounding periods.
    // Checks for type, integer status, and non-negativity.
    if (typeof totalCompoundingPeriods !== 'number' || !Number.isInteger(totalCompoundingPeriods) || totalCompoundingPeriods < 0) {
        console.error("RUNTIME ERROR: The number of compounding periods must be a non-negative integer.");
        // In case of invalid input, a default or error value is returned.
        return 0;
    }

    let currentInvestmentBalance = INITIAL_INVESTMENT_AMOUNT; // Initialize the balance.
    let periodIterator = 0; // A counter to track the current period.

    // Loop through each compounding period. A 'while' loop is used here
    // as an alternative to a 'for' loop, achieving the same iterative effect.
    while (periodIterator < totalCompoundingPeriods) {
        // Calculate the balance after applying the growth factor for the current period.
        let projectedBalanceBeforeCeiling = currentInvestmentBalance * COMPOUNDING_RATE_FACTOR;
        // Apply Math.ceil to round the balance up to the nearest whole unit.
        currentInvestmentBalance = Math.ceil(projectedBalanceBeforeCeiling);

        periodIterator++; // Advance to the next period.
    }

    // Apply the final scaling factor to the accumulated investment balance.
    const finalScaledResult = currentInvestmentBalance * FINAL_OUTPUT_MULTIPLIER;
    return finalScaledResult;
}

// --- Script's Main Execution Flow ---

let rawInputDataBuffer; // Declare a variable to hold the raw data buffer.

try {
    // Attempt to synchronously read all data from the standard input path.
    rawInputDataBuffer = fileSystemModule.readFileSync(STD_INPUT_FILE_PATH);
} catch (ioError) {
    // If an error occurs during file reading, log it and exit the process.
    console.error(`FATAL ERROR: Could not read from standard input. Details: ${ioError.message}`);
    process.exit(1); // Indicate an abnormal termination.
}

// Convert the raw buffer to a string and remove any leading/trailing whitespace.
const cleanedInputString = rawInputDataBuffer.toString().trim();

// Parse the cleaned string into a numeric value. Using Number() is more flexible than parseInt().
const parsedNumericPeriods = Number(cleanedInputString);

// Validate the parsed numeric input to ensure it's a legitimate integer for calculation.
if (isNaN(parsedNumericPeriods) || !Number.isInteger(parsedNumericPeriods)) {
    console.error("INPUT PARSING ERROR: The provided input is not a valid integer. Exiting.");
    process.exit(1); // Terminate due to invalid input format.
}

// Invoke the core calculation function with the validated number of periods.
const ultimateCalculatedValue = determineFutureInvestmentValue(parsedNumericPeriods);

// Output the final computed value to the console.
console.log(ultimateCalculatedValue);