// This module performs statistical calculations on numerical data sets provided via standard input.
// It processes multiple sets of numbers, calculating the standard deviation for each set.

// --- Core Dependencies and Configuration ---
const fileSystemInterface = require('fs'); // Renamed 'fs' to 'fileSystemInterface' for clarity
const inputSourceIdentifier = '/dev/stdin'; // Extracted the input path to a constant for easier modification

// --- Utility Functions for Data Processing ---

/**
 * Transforms a raw string line into an array of floating-point numbers.
 * It handles potential empty strings or non-numeric tokens gracefully.
 * @param {string} lineContent - The textual content of a line from the input.
 * @returns {Array<number>} An array containing only valid numeric values parsed from the line.
 */
function extractNumericElements(lineContent) {
    // If the content is null, undefined, or just whitespace, return an empty array.
    if (!lineContent || lineContent.trim().length === 0) {
        return [];
    }
    // Split the string by spaces, then attempt to convert each part to a float.
    // Filter out any results that are Not-a-Number (NaN), which occur from invalid conversions.
    return lineContent.split(' ').map(parseFloat).filter(val => !Number.isNaN(val));
}

/**
 * Computes the aggregate sum of all numerical values within a given collection.
 * Utilizes a traditional loop for direct summation, avoiding `reduce` for structural variation.
 * @param {Array<number>} numericCollection - An array of numbers to sum up.
 * @returns {number} The total sum of the elements. Returns 0.0 if the collection is empty or invalid.
 */
function calculateAggregateSum(numericCollection) {
    if (!Array.isArray(numericCollection) || numericCollection.length === 0) {
        return 0.0;
    }
    let totalAccumulation = 0.0;
    for (const itemValue of numericCollection) {
        totalAccumulation += itemValue;
    }
    return totalAccumulation;
}

/**
 * Determines the arithmetic mean (average) of a set of numbers.
 * Includes a safeguard against division by zero for empty sets.
 * @param {Array<number>} dataSetElements - The array of numbers for which to compute the mean.
 * @returns {number} The calculated mean, or 0.0 if the dataSetElements is empty.
 */
function determineArithmeticMean(dataSetElements) {
    if (!Array.isArray(dataSetElements) || dataSetElements.length === 0) {
        return 0.0; // Prevent division by zero.
    }
    const totalSummation = calculateAggregateSum(dataSetElements);
    return totalSummation / dataSetElements.length;
}

// --- Main Program Execution Flow ---

// Read the entire content of the standard input stream synchronously.
// The data is expected to be UTF-8 encoded text.
const completeRawInput = fileSystemInterface.readFileSync(inputSourceIdentifier, 'utf8');

// Divide the raw input into an array of individual lines.
// Remove any lines that are entirely empty or just whitespace to clean the input stream.
let processedInputLines = completeRawInput.split('\n').filter(line => line.trim().length > 0);

let dataSetSequenceCounter = 0; // A new variable to keep track of how many data sets have been processed.

// The primary processing loop. It continues as long as there are lines remaining to be processed.
// A 'while' loop with an explicit condition variable `continueProcessing` is used here for flow control variation.
let continueProcessing = true;
while (continueProcessing) {
    // Attempt to retrieve the next line, which is expected to be a control value.
    const controlValueLine = processedInputLines.shift();

    // If there are no more lines, or the line is undefined, it signifies the end of input.
    if (controlValueLine === undefined) {
        continueProcessing = false; // Terminate the loop.
        break;
    }

    // Parse the control value. Using parseInt with radix 10 for explicit integer conversion.
    const currentDataSetSizeIndicator = Number.parseInt(controlValueLine.trim(), 10);

    // Termination condition: if the parsed value is 0 or cannot be parsed (NaN), stop.
    if (Number.isNaN(currentDataSetSizeIndicator) || currentDataSetSizeIndicator === 0) {
        continueProcessing = false; // Set flag to false and break out of the loop.
        break;
    }

    dataSetSequenceCounter++; // Increment the counter for successfully identified data sets.

    // Retrieve the next line, which should contain the actual data points.
    const dataPointsContentLine = processedInputLines.shift();

    // Critical check: If we expected data points but ran out of input lines.
    if (dataPointsContentLine === undefined) {
        console.error(`Error: Incomplete input. Expected data points for set #${dataSetSequenceCounter}, but input ended.`);
        continueProcessing = false;
        break;
    }

    // Parse the line into an array of numbers.
    const collectedNumericPoints = extractNumericElements(dataPointsContentLine);

    // Validation: If no valid numbers were extracted from the line, skip this data set.
    if (collectedNumericPoints.length === 0) {
        console.warn(`Warning: Data set #${dataSetSequenceCounter} contained no valid numeric points. Skipping calculation.`);
        continue; // Proceed to the next iteration of the loop.
    }

    // Calculate the mean of the current data set.
    const calculatedDataSetMean = determineArithmeticMean(collectedNumericPoints);

    // Initialize an accumulator for the sum of squared differences from the mean.
    let sumOfSquaredDeviations = 0.0;
    // Iterate through each data point to calculate its squared deviation from the mean.
    for (const dataPointValue of collectedNumericPoints) {
        const deviationFromMean = dataPointValue - calculatedDataSetMean;
        // Using the exponentiation operator (**) for squaring, an alternative to Math.pow.
        sumOfSquaredDeviations += (deviationFromMean ** 2);
    }

    // Compute the variance: the average of the squared deviations.
    const calculatedDataVariance = sumOfSquaredDeviations / collectedNumericPoints.length;

    // A robustness check: ensure the variance is not negative before taking its square root.
    // Floating point arithmetic can sometimes result in tiny negative numbers near zero.
    const nonNegativeCalculatedVariance = Math.max(0, calculatedDataVariance);

    // Finally, calculate the standard deviation by taking the square root of the variance.
    const finalStandardDeviation = Math.sqrt(nonNegativeCalculatedVariance);

    // Output the result, formatted to exactly five decimal places.
    // Using a template literal for output string construction.
    console.log(`${finalStandardDeviation.toFixed(5)}`);
}

// Optional final message or cleanup if needed after the loop terminates.
// console.log(`Processing complete. Total data sets analyzed: ${dataSetSequenceCounter}.`);