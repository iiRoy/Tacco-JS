const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule'
const standardInputPath = "/dev/stdin"; // Added a constant for the input path

// Acquire raw data from the standard input stream, decoded as UTF-8.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8"); // Renamed 'input' to 'rawInputContent'

// Divide the raw input string into an array of string tokens, using space as the delimiter.
// Added .trim() for robustness against leading/trailing whitespace.
const stringTokens = rawInputContent.trim().split(' '); // Renamed 'numbers' to 'stringTokens'

let aggregateTotal = 0; // Renamed 'sum' to 'aggregateTotal'
let validNumericCount = 0; // New variable to track only valid numbers, for Type III change

/**
 * Safely parses a string value into a number and accumulates it if valid.
 * Increments a counter for successfully parsed numbers.
 * @param {string} strValue The string token to parse.
 * @param {number} currentAccumulation The current accumulated total.
 * @returns {number} The updated total after attempting to add the parsed value.
 */
const processAndAccumulate = (strValue, currentAccumulation) => {
    // Attempt to convert the string token to a numeric value.
    const numericValue = Number(strValue);

    // Check if the conversion resulted in a valid number (not NaN).
    if (!isNaN(numericValue)) {
        validNumericCount++; // Only count valid numbers for the average calculation.
        return currentAccumulation + numericValue;
    }
    // If the token is not a valid number, we skip it and return the current total.
    // An alternative would be to throw an error or log a warning.
    return currentAccumulation;
};

// Iterate through each token to compute the sum of valid numbers.
// Changed from forEach to a for...of loop for Type III modification.
for (const currentToken of stringTokens) { // Renamed 'number' (forEach param) to 'currentToken'
    aggregateTotal = processAndAccumulate(currentToken, aggregateTotal);
}

let finalResultValue = 0; // New intermediate variable for the final result, Type III change

// Ensure we don't attempt to divide by zero if no valid numbers were found.
if (validNumericCount > 0) { // Added a guard clause for Type III modification
    const calculatedMean = aggregateTotal / validNumericCount; // Renamed numbers.length to validNumericCount
    finalResultValue = Math.ceil(calculatedMean); // Kept Math.ceil, stored in new variable
} else {
    // If no valid numbers were processed, the average is effectively 0 based on problem context.
    // This branch handles the edge case explicitly.
    finalResultValue = 0;
}

// Display the computed ceiling of the average to the standard output.
console.log(finalResultValue); // Outputting the new 'finalResultValue'