// Utilize the Node.js file system module for standard input operations.
const fileSystemUtility = require('fs');

/**
 * Reads and processes raw input from a specified path.
 * This function handles file reading, line splitting, trimming, and filtering.
 * @param {string} filePath - The path to read input from, typically '/dev/stdin'.
 * @returns {string[]} An array of strings, where each string is a non-empty, trimmed line from the input.
 */
function acquireInputLines(filePath) {
    try {
        // Read the entire file content as a UTF-8 string.
        const fileContent = fileSystemUtility.readFileSync(filePath, 'utf8');
        // Split the content by newline characters, trim each line, and filter out any empty results.
        return fileContent.split('\n')
                          .map(line => line.trim())
                          .filter(line => line.length > 0);
    } catch (error) {
        // Log an error if input acquisition fails and return an empty array to prevent further processing issues.
        console.error("Input acquisition error:", error.message);
        return [];
    }
}

// Get the array of pre-processed input lines from the standard input source.
const dataLines = acquireInputLines('/dev/stdin');
let currentLinePointer = 0; // An internal pointer to track the current line being processed, mimicking array shifting.

// Define constant upper bounds for the iteration variables to improve readability and maintainability.
const MAX_CUBIC_BASE_VALUE = 100;
const MAX_SQUARE_BASE_VALUE = 1000;

// Initiate the primary processing loop. It continues as long as there are lines available for consumption.
while (currentLinePointer < dataLines.length) {
    // Extract the string representation of the current target number.
    const currentInputString = dataLines[currentLinePointer++];
    // Convert the string to an integer using radix 10 for explicit parsing.
    const mainTargetNumber = parseInt(currentInputString, 10);

    // Perform basic validation on the parsed number.
    // If it's not a valid number (NaN), log a warning and proceed to the next line.
    if (isNaN(mainTargetNumber)) {
        console.error(`Validation Warning: Skipping invalid numeric input "${currentInputString}".`);
        continue;
    }

    // Check for the designated termination signal (a zero value).
    if (mainTargetNumber === 0) {
        break; // Exit the main processing loop if the termination signal is received.
    }

    // Initialize the variable to store the minimum sum found for the current target number.
    // Using MAX_SAFE_INTEGER ensures any valid calculated sum will be smaller.
    let optimalSumFound = Number.MAX_SAFE_INTEGER;
    // A flag to indicate if at least one valid combination (where x >= 0) was found.
    let solutionWasIdentified = false;

    // Outer loop: Iterates through possible values for the base of the cubic term (z).
    for (let zComponent = 0; zComponent <= MAX_CUBIC_BASE_VALUE; zComponent++) {
        // Pre-calculate the cubic value of zComponent to avoid redundant calculations inside the inner loop.
        const zComponentCubed = zComponent * zComponent * zComponent;

        // Early optimization: If the cubic component alone already exceeds the target number,
        // then any positive yComponent will make the sum even larger, resulting in a negative xComponent.
        // Therefore, we can break out of the outer loop for the current mainTargetNumber.
        if (zComponentCubed > mainTargetNumber) {
            break;
        }

        // Inner loop: Iterates through possible values for the base of the square term (y).
        for (let yComponent = 0; yComponent <= MAX_SQUARE_BASE_VALUE; yComponent++) {
            // Pre-calculate the square value of yComponent.
            const yComponentSquared = yComponent * yComponent;

            // Calculate the sum of the cubic and square components.
            const combinedPowersSum = zComponentCubed + yComponentSquared;

            // Early optimization: If the combined sum of powers already exceeds the target number,
            // then the remainder 'x' would be negative. Since yComponent is increasing,
            // further iterations for this zComponent will also yield negative 'x' values.
            // Break out of the inner loop.
            if (combinedPowersSum > mainTargetNumber) {
                break;
            }

            // Calculate the remaining component 'x'.
            // At this point, xRemainder is guaranteed to be non-negative due to the preceding checks.
            const xRemainder = mainTargetNumber - combinedPowersSum;

            // Compute the total sum for the current combination (z + y + x).
            const currentIterationSum = zComponent + yComponent + xRemainder;

            // Update the optimal sum if the current combination yields a smaller total.
            if (currentIterationSum < optimalSumFound) {
                optimalSumFound = currentIterationSum;
                solutionWasIdentified = true; // Mark that a valid solution has been found.
            }
        }
    }

    // Output the computed optimal sum for the current target number.
    // Include a fallback message if no valid combination was found, though for typical inputs,
    // this branch might not be reached if mainTargetNumber > 0.
    if (solutionWasIdentified) {
        console.log(optimalSumFound);
    } else {
        console.log(`No feasible combination found for target value: ${mainTargetNumber}`);
    }
}