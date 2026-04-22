/**
 * Analyzes a string of numerical input to determine if the largest element
 * is strictly smaller than the sum of all other elements in the sequence.
 * This function handles parsing, validation, and computation.
 *
 * @param {string} rawNumericalInput A multi-line string.
 *   The first line should contain an integer indicating the expected count
 *   of numbers in the subsequent line.
 *   The second line should contain space-separated integers.
 *   Example:
 *   "3\n10 20 5"
 */
function analyzeNumericSequence(rawNumericalInput) {
    // Initial validation for the input string presence and type.
    if (typeof rawNumericalInput !== 'string' || rawNumericalInput.trim().length === 0) {
        console.error("Error: The provided input must be a non-empty string.");
        return; // Terminate execution early if input is invalid.
    }

    // Split the raw input into individual lines.
    const contentSegments = rawNumericalInput.split("\n");

    // Ensure we have at least two lines: one for count, one for numbers.
    if (contentSegments.length < 2) {
        console.error("Error: Input string must contain at least two lines (count and numbers).");
        return;
    }

    // Attempt to parse the expected number of elements from the first line.
    const declaredElementCount = parseInt(contentSegments[0].trim(), 10);

    // Validate the parsed count.
    if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
        console.error("Error: The first line must specify a positive integer for the element count.");
        return;
    }

    // Process the second line to extract and convert numerical values.
    // Filters out potential empty strings from multiple spaces, then maps to numbers.
    const numberTokens = contentSegments[1].trim().split(/\s+/).filter(token => token !== '');
    const numericValues = numberTokens.map(Number);

    // Cross-check if the actual number of parsed values matches the declared count.
    if (numericValues.length !== declaredElementCount) {
        console.warn(`Warning: Declared count (${declaredElementCount}) differs from actual parsed count (${numericValues.length}). Proceeding with actual values.`);
        // Depending on requirements, one might choose to throw an error here.
    }

    // Initialize accumulators for the largest element found and the total sum.
    // -Infinity ensures any valid number will become the initial largest.
    let maximumValueEncountered = -Infinity;
    let cumulativeSum = 0;

    // Iterate over each number in the sequence to compute maximum and sum.
    for (const currentNum of numericValues) {
        // Validate each individual number; skip if not a valid number.
        if (isNaN(currentNum)) {
            console.warn(`Warning: Encountered a non-numeric value '${currentNum}' in the sequence. Skipping.`);
            continue;
        }

        // Update the maximum value if the current number is greater.
        if (currentNum > maximumValueEncountered) {
            maximumValueEncountered = currentNum;
        }
        // Add the current number to the running total.
        cumulativeSum += currentNum;
    }

    // Edge case: if no valid numbers were processed.
    if (numericValues.length === 0 || maximumValueEncountered === -Infinity) {
        console.log("No"); // Cannot determine if max < sum of others if no numbers.
        return;
    }

    // Calculate the sum of all elements excluding the maximum element.
    const sumOfRemainingElements = cumulativeSum - maximumValueEncountered;

    // Evaluate the core condition: Is the maximum value less than the sum of the rest?
    // This is equivalent to checking if `2 * maximumValueEncountered < cumulativeSum`.
    const conditionMet = maximumValueEncountered < sumOfRemainingElements;

    // Output the result based on the boolean condition.
    const finalResultOutput = conditionMet ? "Yes" : "No";
    console.log(finalResultOutput);
}

// Entry point for script execution.
// This block reads input from stdin and passes it to the main analysis function.
(function executeFromStdin() {
    const fileSystem = require('fs');
    const standardInputPath = '/dev/stdin';

    try {
        // Read the entire file content as a string, using UTF-8 encoding.
        const stdinContent = fileSystem.readFileSync(standardInputPath, 'utf8');
        // Call the analysis function with the trimmed content to remove extra newlines.
        analyzeNumericSequence(stdinContent.trim());
    } catch (ioError) {
        // Handle potential errors during file reading.
        console.error(`An error occurred while reading from standard input (${standardInputPath}):`, ioError.message);
    }
})();