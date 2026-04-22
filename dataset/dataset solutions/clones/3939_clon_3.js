// This script is designed to compute the lowest possible cumulative expense
// for a journey involving two distinct modes of transport: rail and road.
// It anticipates receiving four distinct monetary values via standard input,
// which represent two separate pricing options for rail services and
// two separate pricing options for road services. The program's final output
// will be the summation of the most economical choice from each transport category.

/**
 * Orchestrates the processing of raw textual input to derive the most cost-effective
 * combined transportation expenditure.
 * @param {string} transportationInputData - The raw input string, expected to contain
 *                                         cost figures, each delimited by a newline character.
 */
function calculateOptimalTravelBudget(transportationInputData) {
    // --- Input Validation Phase ---
    // A robust check to ensure that the input data is present and of the correct type.
    if (typeof transportationInputData !== 'string' || transportationInputData.trim().length === 0) {
        // If the input is not a string or is empty after trimming whitespace,
        // an error message is logged, and the function terminates.
        console.error("Processing halted: Input data is either missing, not a string, or contains only whitespace.");
        return;
    }

    // --- Data Preprocessing Phase ---
    // The input string is broken down into an array of individual line entries.
    // `.filter(entry => entry.trim() !== '')` is employed to automatically discard any empty strings
    // that might result from extraneous newline characters or lines with only whitespace in the input.
    const individualCostLines = transportationInputData.split('\n').filter(entry => entry.trim() !== '');

    // Another critical validation step: ensuring a sufficient number of cost entries.
    // We require at least four entries: two for rail and two for road.
    const REQUIRED_MIN_ENTRIES = 4;
    if (individualCostLines.length < REQUIRED_MIN_ENTRIES) {
        console.error(`Processing halted: Insufficient data. Expected at least ${REQUIRED_MIN_ENTRIES} cost entries, but received ${individualCostLines.length}.`);
        return;
    }

    // --- Helper Function Definition ---
    /**
     * A specialized utility function to convert an array of string-based numeric values
     * into actual numbers and then identify the minimum value among them.
     * It includes safeguards against non-numeric input.
     * @param {string[]} stringValueArray - An array where each element is expected to be a string representation of a number.
     * @returns {number} The smallest numeric value found in the array, or Infinity if no valid numbers are present.
     */
    const determineMinimumNumericValue = (stringValueArray) => {
        // Map each string element to its numeric equivalent.
        // `Number()` is used for explicit conversion, and `.trim()` handles leading/trailing whitespace.
        const parsedNumericValues = stringValueArray.map(strItem => {
            const numVal = Number(strItem.trim());
            if (isNaN(numVal)) {
                // For demonstration, a warning is logged for invalid numeric strings.
                // In a production environment, this might throw an error or use a default value.
                console.warn(`Data anomaly detected: '${strItem}' is not a valid number. It will be excluded from minimum calculation.`);
            }
            return numVal;
        }).filter(val => !isNaN(val)); // Filter out any values that failed to convert to a valid number (NaN).

        // If, after filtering, no valid numbers remain, return Infinity.
        // This ensures that `Math.min` behaves predictably if called with an empty array.
        if (parsedNumericValues.length === 0) {
            return Infinity;
        }

        // Use the spread operator to pass individual numbers to Math.min to find the smallest.
        return Math.min(...parsedNumericValues);
    };

    // --- Cost Extraction and Calculation Phase ---
    // Isolate the first two lines for rail cost options.
    const railServiceOptions = individualCostLines.slice(0, 2);
    // Compute the most affordable rail price using our helper function.
    const cheapestRailFare = determineMinimumNumericValue(railServiceOptions);

    // Isolate the last two lines for road cost options.
    const roadServiceOptions = individualCostLines.slice(-2);
    // Compute the most affordable road price.
    const cheapestRoadFare = determineMinimumNumericValue(roadServiceOptions);

    // --- Final Result Validation ---
    // Check if either of the minimum costs remained at Infinity, which would indicate
    // a failure to find valid numeric options for a transport type.
    if (cheapestRailFare === Infinity || cheapestRoadFare === Infinity) {
        console.error("Critical error: Unable to ascertain valid minimum costs for one or both transport categories. Check input data for malformed numbers.");
        return; // Exit due to unrecoverable error.
    }

    // --- Output Phase ---
    // Sum the two cheapest fares to get the total optimal budget.
    const overallMinimumExpenditure = cheapestRailFare + cheapestRoadFare;

    // Output the calculated total to the console with a descriptive message.
    console.log(`The optimal combined travel expenditure is: ${overallMinimumExpenditure}`);
}

// --- Application Entry Point ---
// This block handles reading input from the standard input stream ('/dev/stdin')
// using Node.js's file system module and then invokes the main processing function.
try {
    // Read the entire content of '/dev/stdin' as a UTF-8 encoded string.
    // Using an options object for clarity and potential future expansion of read flags.
    const systemInputContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    // Pass the read content to our primary function for calculation.
    calculateOptimalTravelBudget(systemInputContent);
} catch (fileReadError) {
    // In case of an error during file reading (e.g., file not found, permission issues).
    console.error("An error occurred while attempting to read from /dev/stdin:", fileReadError.message);
    // As a resilient fallback, the function is called with a default set of zero costs.
    // This allows the program to complete without crashing, albeit with a default result.
    calculateOptimalTravelBudget("0\n0\n0\n0");
}