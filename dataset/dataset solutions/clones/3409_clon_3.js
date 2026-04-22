const fileSystemModule = require('fs');

/**
 * Defines the standard input path for reading data.
 * This constant makes the input source explicit and easily modifiable.
 */
const standardInputPath = '/dev/stdin';

/**
 * Specifies the character encoding to use when reading the input file.
 * UTF-8 is a common and robust choice for text data.
 */
const encodingScheme = 'utf8';

/**
 * A utility function designed to process an array of raw string lines.
 * It skips the initial line, converts subsequent lines into numbers,
 * and includes basic error handling for non-numeric data.
 *
 * @param {string[]} lineSegments - An array of strings, typically from file input, where each string is a line.
 * @returns {number[]} An array containing only the successfully parsed numerical data points.
 */
const extractAndValidateNumericData = (lineSegments) => {
    const collectedNumbers = [];
    // A preliminary check to ensure there's enough data to process after skipping the first line.
    if (lineSegments.length < 2) {
        console.warn('Warning: Input data contains insufficient lines (less than two) for processing after initial skip.');
        return collectedNumbers; // Returns an empty array if data is sparse.
    }

    // Loop through the input lines, starting from the second element (index 1),
    // as the first line is intentionally skipped as per the original logic.
    for (let currentLineIndex = 1; currentLineIndex < lineSegments.length; currentLineIndex++) {
        const trimmedRawValue = lineSegments[currentLineIndex].trim(); // Remove leading/trailing whitespace.
        const numericConversion = Number.parseFloat(trimmedRawValue); // Robust conversion to float.

        // Validate if the conversion resulted in a valid number.
        if (!Number.isNaN(numericConversion)) {
            collectedNumbers.push(numericConversion);
        } else {
            // Log an error for unparseable lines, but continue processing other valid data.
            console.error(`Data Parsing Error: Could not convert "${trimmedRawValue}" into a valid number. This line will be skipped.`);
        }
    }
    return collectedNumbers;
};

/**
 * Identifies and returns the maximum numerical value from a given array of numbers.
 * Includes a guard condition for handling empty input arrays gracefully.
 *
 * @param {number[]} numericalArray - An array of numeric values.
 * @returns {number | null} The highest number found in the array, or `null` if the array is empty.
 */
const determinePeakValue = (numericalArray) => {
    // If the array is empty, there's no maximum value to find.
    if (numericalArray.length === 0) {
        console.log("No numbers provided to determine the peak value.");
        return null;
    }
    // Leverage the built-in Math.max function for efficient maximum finding.
    return Math.max(...numericalArray);
};

/**
 * This is the core processing function that orchestrates the data transformation
 * and computes a specialized sum based on a unique rule: the very first occurrence
 * of the maximum value in the sequence is halved before being added to the total,
 * while all other values (including subsequent occurrences of the maximum) are added normally.
 *
 * @param {string[]} incomingRawLines - An array of raw string lines read from an input source.
 * @returns {number} The final calculated sum after applying the special rule.
 */
const computeConditionalSum = (incomingRawLines) => {
    // Phase 1: Prepare the numeric data from the raw input lines.
    const processedNumericPoints = extractAndValidateNumericData(incomingRawLines);

    // Early exit if no valid numeric data points were obtained.
    if (processedNumericPoints.length === 0) {
        console.log("No valid numeric data points available for sum calculation.");
        return 0; // Return zero if nothing to sum.
    }

    // Phase 2: Identify the highest value within the prepared numeric data.
    const highestElement = determinePeakValue(processedNumericPoints);

    // Another safeguard in case the highest element could not be determined (e.g., all data was invalid).
    if (highestElement === null) {
        console.log("Cannot calculate sum as the highest element could not be determined.");
        return 0;
    }

    // Initialize variables for the cumulative sum and a boolean flag
    // to track whether the highest element has already been halved.
    let cumulativeSumResult = 0;
    let hasHighestBeenHalvedOnce = false; // This flag ensures the special rule applies only to the first instance.

    // Phase 3: Iterate through each numeric data point to build the specialized sum.
    for (const currentDataPoint of processedNumericPoints) {
        // Apply the special rule: if it's the highest element AND it hasn't been halved yet.
        if (!hasHighestBeenHalvedOnce && currentDataPoint === highestElement) {
            cumulativeSumResult += currentDataPoint / 2;
            hasHighestBeenHalvedOnce = true; // Mark the flag to prevent future halving of the max.
        } else {
            // For all other cases (not the max, or the max has already been halved), add normally.
            cumulativeSumResult += currentDataPoint;
        }
    }

    // Return the final computed sum.
    return cumulativeSumResult;
};

// Main execution block: This part handles reading from stdin, invoking the processing logic,
// and outputting the final result, complete with error handling.
try {
    // Read the entire content from the specified standard input path.
    const rawBufferContent = fileSystemModule.readFileSync(standardInputPath, encodingScheme);
    // Clean up the raw content: trim whitespace from start/end, then split into an array of lines.
    const separatedInputLines = rawBufferContent.trim().split('\n');

    // Invoke the primary function to perform the complex sum calculation.
    const finalCalculatedOutput = computeConditionalSum(separatedInputLines);

    // Display the computed result to the console.
    console.log(finalCalculatedOutput);
} catch (operationalError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error(`An unexpected error occurred during program execution: ${operationalError.message}`);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}