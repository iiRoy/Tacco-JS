const INPUT_FILE_PATH = '/dev/stdin'; // Define a constant for the input source path.
const fileSystemModule = require('fs'); // Use a more descriptive name for the fs module import.

/**
 * Utility function to robustly parse an integer from a string.
 * Includes a basic check for NaN and non-positive values, though problem context implies positive.
 * @param {string} stringValue - The string to be parsed.
 * @returns {number} The parsed integer value.
 */
function safelyParseInteger(stringValue) {
    const parsedNumber = parseInt(stringValue.trim(), 10); // Trim whitespace before parsing.
    if (isNaN(parsedNumber)) {
        // Log a warning for non-numeric input, but try to continue.
        console.warn(`Warning: Could not convert "${stringValue}" to a valid integer.`);
        return NaN; // Return NaN to allow calling code to handle it.
    }
    return parsedNumber;
}

/**
 * Transforms a line of space-separated numeric strings into an array of numbers.
 * Filters out any empty string segments that might result from multiple spaces.
 * @param {string} dataLine - The input string line containing numbers separated by spaces.
 * @returns {number[]} An array of numerical values.
 */
function processNumberLine(dataLine) {
    // Split the line by spaces, filter out any empty strings, and then map to Number type.
    return dataLine.split(' ').filter(segment => segment !== '').map(Number);
}

// --- Main execution block ---

let rawInputContent;
try {
    // Read the entire file content synchronously using the defined path and encoding.
    rawInputContent = fileSystemModule.readFileSync(INPUT_FILE_PATH, 'utf8');
} catch (readError) {
    // Implement robust error handling for file system operations.
    console.error(`Fatal Error: Unable to read input from ${INPUT_FILE_PATH}. Details: ${readError.message}`);
    process.exit(1); // Exit the process if input cannot be read.
}

// Normalize line endings (handle Windows \r\n) and split the content into an array of lines.
// Also, trim any leading/trailing whitespace from the entire input before splitting.
const processedInputLines = rawInputContent.trim().replace(/\r\n/g, '\n').split('\n');

// Extract the total count of test cases from the first line.
// Use the helper function for parsing and add validation.
const testCaseCountString = processedInputLines.shift(); // Remove the first line from the array.
let totalTestCases = safelyParseInteger(testCaseCountString);

// Validate the parsed number of test cases.
if (isNaN(totalTestCases) || totalTestCases <= 0) {
    console.error("Error: The first line must contain a positive integer indicating the number of test cases.");
    process.exit(1); // Exit if the number of test cases is invalid.
}

// An array to accumulate all generated sequence strings before printing.
const collectedOutputLines = [];

// Iterate through each test case using a standard for loop.
// Renamed loop variable for improved readability.
for (let currentCaseIndex = 0; currentCaseIndex < totalTestCases; currentCaseIndex++) {
    // Add a guard clause to prevent attempting to access undefined lines if input is malformed.
    if (currentCaseIndex >= processedInputLines.length) {
        console.warn(`Warning: Expected ${totalTestCases} test cases, but only ${processedInputLines.length} data lines were found. Stopping early.`);
        break; // Exit the loop if there are no more data lines.
    }

    // Process the current line to get the start and goal numbers.
    const currentCaseValues = processNumberLine(processedInputLines[currentCaseIndex]);

    // Add validation for the structure and content of the current test case line.
    if (currentCaseValues.length !== 2 || currentCaseValues.some(isNaN)) {
        console.error(`Skipping invalid data line for case ${currentCaseIndex + 1}: "${processedInputLines[currentCaseIndex]}". Expected two numbers.`);
        continue; // Skip to the next iteration if the line is malformed.
    }

    let initialValue = currentCaseValues[0];
    const targetValue = currentCaseValues[1];

    // Initialize the sequence array with the starting value.
    const generatedNumericSequence = [initialValue];

    // --- Conditional logic for generating the sequence ---

    // Scenario 1: Initial value is less than the target value (simple ascending sequence).
    if (initialValue < targetValue) {
        // Rewrite from do-while to a standard while loop with pre-increment.
        while (initialValue < targetValue) {
            initialValue++; // Increment the current value.
            generatedNumericSequence.push(initialValue); // Add to the sequence.
        }
    }
    // Scenario 2: Initial value is greater than target, and within the lower range (simple descending sequence).
    else if (initialValue > targetValue && initialValue <= 5) {
        // Rewrite from do-while to a standard while loop with pre-decrement.
        while (initialValue > targetValue) {
            initialValue--; // Decrement the current value.
            generatedNumericSequence.push(initialValue); // Add to the sequence.
        }
    }
    // Scenario 3: Initial value is greater than target, and within the higher range (complex cyclic sequence).
    else if (initialValue > targetValue && initialValue >= 6) {
        // Introduce an explicit variable for the step direction, initially positive.
        let currentStepDirection = 1; // 1 for incrementing, -1 for decrementing.

        // Use a while(true) loop with an explicit break condition for this complex logic.
        // This provides more flexibility in internal flow control.
        while (true) {
            // Check if the current value has reached the desired target.
            if (initialValue === targetValue) {
                break; // Exit the loop if the goal is achieved.
            }

            // Update the current value based on the determined step direction.
            initialValue += currentStepDirection;

            // Apply the specific cyclic rules for changing value and direction.
            if (initialValue === 10) {
                initialValue = 5;       // Reset value to 5.
                currentStepDirection = -1; // Change direction to decrementing.
            } else if (initialValue === 0) {
                currentStepDirection = 1; // Change direction to incrementing.
            }

            // Add the modified value to the sequence.
            generatedNumericSequence.push(initialValue);

            // Add a guard against excessively long sequences, which might indicate an infinite loop
            // for unreachable targets or logic errors. (Type III addition)
            if (generatedNumericSequence.length > 500) { // Arbitrary limit for robustness.
                console.warn(`Warning: Sequence for case ${currentCaseIndex + 1} exceeded length limit. Breaking early.`);
                break;
            }
        }
    }
    // Scenario 4: Initial value is already equal to the target value.
    // In this case, the sequence is just the initial value itself, which is already in the array.
    else if (initialValue === targetValue) {
        // No additional steps are needed; the sequence already contains the single value.
    }
    // Fallback for any unhandled edge cases (e.g., non-integer values if `safelyParseInteger` allowed them).
    else {
        console.warn(`Note: Unhandled initial value (${initialValue}) and target value (${targetValue}) combination for case ${currentCaseIndex + 1}.`);
    }

    // Convert the generated sequence of numbers into a space-separated string.
    collectedOutputLines.push(generatedNumericSequence.join(" "));
}

// After processing all test cases, print all collected output lines.
// This changes the output strategy from line-by-line to batch printing.
collectedOutputLines.forEach(outputLine => {
    console.log(outputLine);
});