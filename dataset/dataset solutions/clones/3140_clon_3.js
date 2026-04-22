/**
 * This module processes a specific type of tabular data from standard input.
 * It calculates a weighted sum for each data row and counts how many of these sums
 * exceed a predefined threshold after applying a global offset.
 *
 * The input format is expected to be:
 * 1. A single line containing three space-separated integers: N (number of data rows),
 *    M (number of coefficients/columns), and C (a constant offset).
 * 2. A single line containing M space-separated integers, representing the
 *    coefficient vector (B).
 * 3. N subsequent lines, each containing M space-separated integers, representing
 *    the data rows (A_i).
 *
 * The calculation for each row is: C + sum(A_i[j] * B[j]) for j from 0 to M-1.
 * The final output is the total count of rows for which this calculation yields a value greater than zero.
 */
(function processDataSource() {
    "use strict"; // Keeping strict mode, but moved it inside the IIFE.

    /**
     * Executes the core algorithm to analyze the provided input content.
     * @param {string} rawInputContent - The raw string content from the input source.
     * @returns {string} The computed result, formatted as a string.
     */
    function analyzeDataStructure(rawInputContent) {
        // Prepare input lines for sequential access.
        // The original reversed the array and used pop. We'll use shift for a more natural flow.
        const allInputLines = rawInputContent.trim().split("\n");
        const resultsContainer = []; // Collects output segments.

        // Helper function to extract and parse the next line of input.
        const obtainNextInputLine = () => {
            const currentLine = allInputLines.shift();
            // Basic validation for missing lines, although more robust error handling might be needed.
            if (currentLine === undefined) {
                throw new Error("Insufficient input data: Expected more lines than provided.");
            }
            return currentLine;
        };

        // Helper to convert a space-separated string of numbers into an array of integers.
        const parseLineToNumberArray = (inputString) => {
            return inputString.split(" ").map(Number);
        };

        // Helper to compute the dot product of two vectors.
        const computeVectorDotProduct = (firstVector, secondVector) => {
            // Defensive check for vector length mismatch.
            if (firstVector.length !== secondVector.length) {
                throw new Error("Vector dimensions mismatch for dot product calculation.");
            }
            let productAccumulator = 0;
            for (let elementIndex = 0; elementIndex < firstVector.length; ++elementIndex) {
                productAccumulator += firstVector[elementIndex] * secondVector[elementIndex];
            }
            return productAccumulator;
        };

        // --- Start of main processing logic ---

        // Attempt to read the initial configuration parameters (N, M, C).
        const configurationParameters = parseLineToNumberArray(obtainNextInputLine());
        if (configurationParameters.length !== 3) {
            throw new Error("Malformed configuration line: Expected 3 parameters (N, M, C).");
        }
        const [numberOfDataRows, numberOfColumns, initialConstantOffset] = configurationParameters;

        // Validate basic parameters.
        if (numberOfDataRows <= 0 || numberOfColumns <= 0) {
            resultsContainer.push("Error: Number of rows and columns must be positive.");
            return resultsContainer.join("\n");
        }

        // Read the coefficient vector (B).
        const coefficientArray = parseLineToNumberArray(obtainNextInputLine());
        if (coefficientArray.length !== numberOfColumns) {
            throw new Error(`Coefficient array length mismatch: Expected ${numberOfColumns}, got ${coefficientArray.length}.`);
        }

        let totalPositiveSumInstances = 0; // Counter for results greater than zero.

        // Iterate through each data row (A_i).
        for (let rowIterator = 0; rowIterator < numberOfDataRows; ++rowIterator) {
            const currentDataRow = parseLineToNumberArray(obtainNextInputLine());

            // Validate current row's length.
            if (currentDataRow.length !== numberOfColumns) {
                // Instead of failing, we can add a warning and skip this malformed row.
                resultsContainer.push(`Warning: Row ${rowIterator + 1} has an incorrect number of elements. Skipping this row.`);
                continue; // Move to the next row.
            }

            // Calculate the weighted sum for the current row.
            const dotProductResult = computeVectorDotProduct(currentDataRow, coefficientArray);
            const finalEvaluationScore = initialConstantOffset + dotProductResult;

            // Check if the final score exceeds the threshold.
            if (finalEvaluationScore > 0) {
                totalPositiveSumInstances++;
            }
        }

        // Add the final count to our results.
        resultsContainer.push(totalPositiveSumInstances);

        // Concatenate all collected output segments into a single string.
        return resultsContainer.join("\n");
    }

    // --- Execution entry point for Node.js environment ---
    try {
        const fileSystem = require("fs");
        const standardInputPath = "/dev/stdin"; // Standard path for input redirection.
        const inputContent = fileSystem.readFileSync(standardInputPath, "utf8");

        const finalOutput = analyzeDataStructure(inputContent);
        console.log(finalOutput); // Print the final result to standard output.

    } catch (executionError) {
        // Catch and report any errors that occur during file reading or algorithm execution.
        console.error("An operational error occurred:", executionError.message);
        // Optionally, exit with a non-zero status code to indicate failure.
        // process.exit(1);
    }
})();