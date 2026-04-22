const fileSystemHandler = require('fs');

// Define the standard input stream path.
const standardInputSource = '/dev/stdin';

// --- Input Acquisition and Initial Processing ---

// Attempt to read the entire content from the standard input synchronously.
let rawStreamData;
try {
    rawStreamData = fileSystemHandler.readFileSync(standardInputSource, 'utf8');
} catch (acquisitionError) {
    // Log an error and exit if input cannot be read.
    console.error("Failed to read data from standard input:", acquisitionError.message);
    process.exit(1);
}

// Basic validation: Check if the acquired data is empty or consists only of whitespace.
if (!rawStreamData || rawStreamData.trim().length === 0) {
    console.error("No input data received. Please ensure input is provided.");
    process.exit(1);
}

// Split the raw data into individual lines, then filter out any empty string lines.
const parsedInputLines = rawStreamData.split('\n').filter(lineSegment => lineSegment.trim() !== '');

// --- Data Validation and Conversion Helpers ---

// Constant for the required number of input lines.
const REQUIRED_DATA_POINTS = 5;

// Verify that the number of parsed lines meets the minimum requirement.
if (parsedInputLines.length < REQUIRED_DATA_POINTS) {
    console.error(`Insufficient data points. Expected at least ${REQUIRED_DATA_POINTS} lines, but received ${parsedInputLines.length}.`);
    process.exit(1);
}

/**
 * Safely converts a string to a number, with error handling for invalid numeric formats.
 * @param {string} stringValue The string to be converted.
 * @param {string} contextLabel A label to identify the value in error messages (e.g., "price", "quantity").
 * @returns {number} The successfully parsed numeric value.
 */
const convertToNumberSafely = (stringValue, contextLabel) => {
    const processedValue = Number(stringValue);
    if (isNaN(processedValue)) {
        // If conversion results in NaN, throw an error with context.
        throw new Error(`Data conversion error: '${stringValue}' is not a valid number for ${contextLabel}.`);
    }
    return processedValue;
};

// --- Array Population and Data Transformation ---

// Extract and convert the first three lines into an array representing main dish costs.
const mainDishCosts = parsedInputLines.slice(0, 3).map((lineItem, idx) => {
    try {
        return convertToNumberSafely(lineItem.trim(), `main dish option ${idx + 1}`);
    } catch (conversionErr) {
        console.error(conversionErr.message);
        process.exit(1); // Exit if any price is invalid.
    }
});

// Extract and convert the next two lines into an array for beverage expenses.
const beverageExpenses = parsedInputLines.slice(3, 5).map((lineItem, idx) => {
    try {
        return convertToNumberSafely(lineItem.trim(), `beverage option ${idx + 1}`);
    } catch (conversionErr) {
        console.error(conversionErr.message);
        process.exit(1); // Exit if any expense is invalid.
    }
});

// --- Core Logic: Finding Minimums ---

/**
 * Determines the smallest number within a given array of numbers.
 * @param {number[]} numericValues An array of numbers.
 * @returns {number} The minimum value found in the array.
 */
const retrieveMinimumFromArray = (numericValues) => {
    // Basic check for empty or non-array input to prevent errors.
    if (!Array.isArray(numericValues) || numericValues.length === 0) {
        throw new Error("Cannot determine minimum: Input must be a non-empty array of numbers.");
    }
    // Utilize the spread operator for a cleaner way to pass array elements to Math.min.
    return Math.min(...numericValues);
};

// Calculate the lowest cost among the main dish selections.
const minimumMainDishPrice = retrieveMinimumFromArray(mainDishCosts);

// Calculate the lowest cost among the beverage selections.
const minimumBeveragePrice = retrieveMinimumFromArray(beverageExpenses);

// --- Final Calculation and Output ---

// Sum the two minimums to get the overall lowest combined price.
const finalCombinedMinimum = minimumMainDishPrice + minimumBeveragePrice;

// Present the calculated result to the user.
console.log(finalCombinedMinimum);