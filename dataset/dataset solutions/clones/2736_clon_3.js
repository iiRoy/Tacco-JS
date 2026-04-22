"use strict";

// Utility function to safely read content from a specified file path.
// This abstraction improves modularity and error handling for I/O operations.
function retrieveFileContent(filePath) {
    try {
        return require('fs').readFileSync(filePath, 'utf8');
    } catch (fileError) {
        console.error("CRITICAL ERROR: Failed to access or read the input file at path:", filePath, "\nDetails:", fileError.message);
        // Terminate process if essential input cannot be acquired.
        process.exit(1);
    }
}

/**
 * Analyzes a series of numeric values by iteratively removing each element
 * and computing the maximum value from the remaining subset.
 *
 * @param {string} incomingDataPayload - The raw string input, expected to contain
 *                                     a count on the first line, followed by
 *                                     numeric values on subsequent lines.
 */
function processNumericalAnalysis(incomingDataPayload) {
    // Initial validation: Ensure the input string is valid and not empty.
    if (!incomingDataPayload || typeof incomingDataPayload !== 'string' || incomingDataPayload.trim().length === 0) {
        console.warn("Input data stream is empty or malformed. No analysis can be performed.");
        return; // Gracefully exit if no data is provided.
    }

    // Break down the entire input payload into individual lines.
    const dataLinesCollection = incomingDataPayload.split("\n");

    // Attempt to parse the first line as the expected number of data entries.
    const declaredDataCount = parseInt(dataLinesCollection[0], 10);

    // Validate the parsed count. It must be a positive integer.
    if (isNaN(declaredDataCount) || declaredDataCount <= 0) {
        console.error("Configuration Error: The initial line must specify a positive integer for the number of data elements.");
        return; // Halt if the count is invalid.
    }

    // Extract and convert the actual data lines into an array of floating-point numbers.
    // We slice the array to include only the data entries as per declaredDataCount,
    // then map each line to a number, and finally filter out any non-numeric results.
    const processedNumericalValues = dataLinesCollection
        .slice(1, declaredDataCount + 1) // Fetch lines from index 1 up to the declared count
        .map(currentLine => parseFloat(currentLine.trim())) // Convert each trimmed line to a number
        .filter(valueCandidate => !isNaN(valueCandidate)); // Retain only successfully parsed numbers

    // Optional warning: Check if the number of successfully parsed values matches the declared count.
    if (processedNumericalValues.length !== declaredDataCount) {
        console.warn(`Data Mismatch Warning: Expected ${declaredDataCount} numeric entries, but successfully parsed ${processedNumericalValues.length}. Analysis will proceed with available data.`);
    }

    // If no valid numeric data was found after all parsing and filtering, report and exit.
    if (processedNumericalValues.length === 0) {
        console.log("No valid numeric data points were identified for analysis.");
        return;
    }

    // The core logic: Iterate through each element in the processed data set.
    // In each iteration, we construct a temporary subset excluding the current element,
    // then find and output the maximum value within that subset.
    for (let currentOmissionPoint = 0; currentOmissionPoint < processedNumericalValues.length; ++currentOmissionPoint) {
        // Build a temporary collection of values, omitting the element at currentOmissionPoint.
        const currentWorkingSubset = [];
        for (let sourceIndex = 0; sourceIndex < processedNumericalValues.length; sourceIndex++) {
            if (sourceIndex !== currentOmissionPoint) {
                currentWorkingSubset.push(processedNumericalValues[sourceIndex]);
            }
        }

        // If, after omitting an element, the subset is empty (e.g., original array had only one item),
        // we cannot compute a maximum.
        if (currentWorkingSubset.length === 0) {
            console.log("NO_MAX (Original set contained only one element, nothing remains for comparison)");
            continue; // Proceed to the next iteration, though typically the loop would end here.
        }

        // Determine the largest value within the current subset using the spread operator for Math.max.
        const highestValueInSubset = Math.max(...currentWorkingSubset);

        // Output the result for the current iteration.
        console.log(highestValueInSubset);
    }
}

// Execution entry point: Read data from standard input and begin the analysis.
const standardInputLocation = '/dev/stdin';
const rawInputContent = retrieveFileContent(standardInputLocation);
processNumericalAnalysis(rawInputContent);