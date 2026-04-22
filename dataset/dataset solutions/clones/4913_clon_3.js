const tryParseInt = (strValue) => {
    // Robustly attempts to parse a string into an integer.
    // Returns 0 if parsing fails or input is not a valid number.
    const numResult = Number.parseInt(strValue, 10);
    return Number.isNaN(numResult) ? 0 : numResult;
};

const calculateCeilingDivision = (numerator, denominator) => {
    // Computes the ceiling of a division operation.
    // Includes a safeguard against division by zero, returning Infinity in such cases.
    if (denominator === 0) {
        // Division by zero is undefined; returning Infinity indicates an extreme scale.
        return Infinity;
    }
    return Math.ceil(numerator / denominator);
};

function processAccumulationSequence(rawProblemData) {
    // This primary function orchestrates the calculation of accumulated alpha and beta values.

    // Step 1: Initial validation of the input data.
    // If the input is not a string or is empty after trimming, an error is logged,
    // and a default sum of 0 is returned, indicating an unprocessable input.
    if (typeof rawProblemData !== 'string' || rawProblemData.trim() === '') {
        console.error("Error: Provided input data is either invalid or completely empty.");
        return 0;
    }

    // Step 2: Prepare the input by splitting it into individual lines.
    // `trim()` removes leading/trailing whitespace from the whole block before splitting.
    const allInputLines = rawProblemData.trim().split("\n");

    // Step 3: Extract the count of data entries from the very first line.
    // `tryParseInt` is used for safe conversion, handling potential non-numeric input gracefully.
    const totalEntriesCount = tryParseInt(allInputLines[0]);

    // Step 4: Validate the `totalEntriesCount` and the integrity of the input lines.
    // Ensures that the count is positive and that enough lines are present for processing.
    if (totalEntriesCount <= 0 || allInputLines.length < totalEntriesCount + 1) {
        console.warn("Warning: The declared number of entries is invalid or insufficient data lines were provided.");
        return 0; // Return 0 if data integrity is compromised.
    }

    // Step 5: Initialize the two cumulative values.
    // These values (`currentAlphaVal` and `currentBetaVal`) will be updated iteratively.
    let currentAlphaVal = 1; // Represents the 'A' value from the original problem.
    let currentBetaVal = 1;  // Represents the 'T' value from the original problem.

    // Step 6: Iterate through each data entry (starting from the second line of the input).
    // The loop processes `totalEntriesCount` lines to update the cumulative values.
    for (let currentLineIndex = 1; currentLineIndex <= totalEntriesCount; ++currentLineIndex) {
        const lineContent = allInputLines[currentLineIndex];

        // Step 6a: Parse the current line into its constituent numeric parts.
        // `split(" ")` divides the line by spaces, `filter(Boolean)` removes empty strings
        // that might result from multiple spaces, and `map(tryParseInt)` converts tokens to numbers.
        const parsedLineNumbers = lineContent
                                    .split(" ")
                                    .filter(Boolean)
                                    .map(tryParseInt);

        // Step 6b: Basic validation for the number of elements on the current line.
        // Each data line is expected to contain exactly two numeric values.
        if (parsedLineNumbers.length < 2) {
            console.error(`Error: Skipping malformed data line at index ${currentLineIndex}. Expected 2 numbers, found ${parsedLineNumbers.length}. Line: "${lineContent}"`);
            continue; // Move to the next iteration if the current line is malformed.
        }

        // Step 6c: Extract the specific multipliers for the current iteration.
        const desiredBetaMultiplier = parsedLineNumbers[0]; // Corresponds to `Ti`
        const desiredAlphaMultiplier = parsedLineNumbers[1]; // Corresponds to `Ai`

        // Step 6d: Calculate the minimum scaling factor required for each value independently.
        // This ensures that both `currentBetaVal` and `currentAlphaVal` meet or exceed their new targets.
        const minScaleForBeta = calculateCeilingDivision(currentBetaVal, desiredBetaMultiplier);
        const minScaleForAlpha = calculateCeilingDivision(currentAlphaVal, desiredAlphaMultiplier);

        // Step 6e: Determine the overall common scaling factor.
        // The largest of the two individual scaling factors must be used to satisfy both conditions.
        const finalCommonScaleFactor = Math.max(minScaleForBeta, minScaleForAlpha);

        // Step 6f: Update the cumulative values using the `finalCommonScaleFactor`.
        currentBetaVal = desiredBetaMultiplier * finalCommonScaleFactor;
        currentAlphaVal = desiredAlphaMultiplier * finalCommonScaleFactor;
    }

    // Step 7: Compute the final sum of the accumulated alpha and beta values.
    const finalComputedSum = currentAlphaVal + currentBetaVal;

    // Step 8: Return the result of the entire accumulation process.
    return finalComputedSum;
}

// This section handles the execution environment, typically for competitive programming.
// It reads input from standard input, processes it, and prints the result to standard output.
const fileSystemAccess = require("fs"); // Import the Node.js file system module.
const standardInputPath = "/dev/stdin"; // Define the path for standard input.

// Read the entire content from standard input, decoded as UTF-8 text.
const rawInputDataContent = fileSystemAccess.readFileSync(standardInputPath, "utf8");

// Invoke the main processing function with the raw input data.
const overallResult = processAccumulationSequence(rawInputDataContent);

// Output the final calculated result to the console.
console.log(overallResult);