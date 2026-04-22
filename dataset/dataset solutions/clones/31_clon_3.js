// A Type III clone for calculating a projected financial value over periods.

// Utilize the Node.js file system module for input operations.
const fileSystemModule = require('node:fs');

/**
 * Helper function to round a numeric value upwards to the nearest multiple of a specified increment.
 * This ensures that intermediate calculations always meet a minimum value threshold.
 * @param {number} numericValue - The number to be rounded.
 * @param {number} roundingIncrement - The positive integer increment to round up to.
 * @returns {number} The value rounded up to the nearest `roundingIncrement`.
 */
function elevateToNearestIncrement(numericValue, roundingIncrement) {
    // Pre-check for invalid increment to prevent runtime errors or incorrect behavior.
    if (typeof roundingIncrement !== 'number' || roundingIncrement <= 0 || !Number.isInteger(roundingIncrement)) {
        console.error("Error: The rounding increment must be a positive integer.");
        // Depending on context, one might throw an error or return the original value.
        // For this scenario, returning the original value allows the program to continue with a warning.
        return numericValue;
    }
    // Apply the ceiling function after division, then multiply back to get the rounded value.
    return Math.ceil(numericValue / roundingIncrement) * roundingIncrement;
}

// Define key parameters as constants for enhanced readability and maintainability.
const standardInputDevicePath = '/dev/stdin';
const initialInvestmentAmount = 100000.0; // Starting capital as a floating-point number.
const periodicGrowthMultiplier = 1.05;    // Each period increases the value by 5%.
const valueRoundingUnit = 1000;         // Values are rounded up to the nearest thousand.

// Encapsulate the primary logic within an Immediately Invoked Function Expression (IIFE)
// to manage scope and execution flow effectively.
(function executeFinancialProjection() {
    let rawDataFromInput;

    // Attempt to read the input from the designated standard input path.
    try {
        rawDataFromInput = fileSystemModule.readFileSync(standardInputDevicePath, 'utf8');
    } catch (dataReadError) {
        // If reading fails, log the error and terminate the process gracefully.
        console.error(`An error occurred while accessing input: ${dataReadError.message}`);
        process.exit(1); // Indicate an abnormal termination.
    }

    // Sanitize and convert the raw input string into a usable integer.
    const trimmedInputString = rawDataFromInput.trim();
    let totalProjectionPeriods = Number(trimmedInputString);

    // Implement robust validation for the parsed input to ensure it meets requirements.
    if (isNaN(totalProjectionPeriods) || !Number.isInteger(totalProjectionPeriods) || totalProjectionPeriods < 0) {
        console.error("Invalid input detected. Please supply a non-negative whole number for the projection periods.");
        process.exit(1); // Exit due to invalid input.
    }

    // Initialize the dynamic variable that will store the evolving financial value.
    let currentPortfolioValue = initialInvestmentAmount;
    let iterationCounter = 0; // A counter to track the current period.

    // Loop through each projection period, applying the growth and rounding rules.
    while (iterationCounter < totalProjectionPeriods) {
        // First, apply the periodic growth to the current value.
        currentPortfolioValue *= periodicGrowthMultiplier;

        // Next, round the newly grown value up to the nearest specified unit.
        currentPortfolioValue = elevateToNearestIncrement(currentPortfolioValue, valueRoundingUnit);

        // Advance to the next period.
        iterationCounter++;
    }

    // Output the final calculated portfolio value.
    // Using process.stdout.write for direct output, followed by a newline character.
    process.stdout.write(currentPortfolioValue.toString() + '\n');

    // Optional: Add a debug message if a specific environment variable is set.
    // This fragment demonstrates conditional logging for extended functionality.
    if (process.env.FINANCIAL_DEBUG === 'true') {
        console.info(`Projection completed for ${totalProjectionPeriods} periods.`);
        console.info(`Final calculated value: ${currentPortfolioValue.toFixed(2)}`);
    }

})(); // The IIFE is immediately executed.