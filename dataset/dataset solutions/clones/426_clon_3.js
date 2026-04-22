// This script is designed to process numerical input, typically from standard input.
// It groups pairs of numbers, sums them, and then analyzes these sums in sets of five.
// For each complete set, it identifies the highest sum and prints a corresponding
// alphabetical identifier ('A' through 'E') along with that maximum value.

// Define constants to enhance readability and maintainability.
const GROUP_SIZE_LIMIT = 5; // The number of collected sums required to form a full group.
const TERMINATION_SEQUENCE = "0 0"; // A specific input line that signals the end of processing,
                                     // but only if encountered when no sums have been collected yet.
const FIRST_IDENTIFIER_CHAR_CODE = 'A'.charCodeAt(0); // ASCII code for 'A', used as a base for character mapping.

// Utilize the 'fs' module to read all incoming data from '/dev/stdin' as a UTF-8 string.
var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. Remove any leading or trailing whitespace (like newlines at the end of the file).
// 2. Split the cleaned string into an array of individual lines, using the newline character as a delimiter.
var processedInputLines = rawInputContent.trim().split("\n");

// This array will temporarily store the sums of number pairs as they are read from input lines.
// Once it reaches the GROUP_SIZE_LIMIT, its contents will be analyzed and then reset.
var accumulatedSums = [];

// A control flag to manage the main loop's execution.
// It will be set to `false` if the termination sequence is encountered.
var continueDataProcessing = true;

// Iterate through each line of the `processedInputLines` array.
// The loop continues as long as there are lines to process and the `continueDataProcessing` flag is true.
for (let currentLineIndex = 0; currentLineIndex < processedInputLines.length && continueDataProcessing; currentLineIndex++) {
    // Retrieve the current line from the array for processing.
    const currentInputLine = processedInputLines[currentLineIndex];

    // First check: Evaluate the termination condition.
    // If `accumulatedSums` is empty AND the current line matches the `TERMINATION_SEQUENCE`,
    // it signifies the end of the data stream according to the problem's rules.
    if (accumulatedSums.length === 0 && currentInputLine === TERMINATION_SEQUENCE) {
        continueDataProcessing = false; // Set the flag to stop the loop.
        continue; // Skip the rest of the current iteration and exit the loop (due to the flag).
    }

    // Second check: Determine if a full group of sums has been collected.
    // This check occurs before attempting to add the current line's sum.
    if (accumulatedSums.length === GROUP_SIZE_LIMIT) {
        // A full group has been formed; now, find the maximum sum within this group.
        let maximumValueInGroup = -Infinity; // Initialize with the smallest possible number.
        let indexOfMaximum = -1;             // Store the index of the maximum value.

        // Loop through the collected sums to find the highest value and its position.
        for (let j = 0; j < accumulatedSums.length; j++) {
            if (accumulatedSums[j] > maximumValueInGroup) {
                maximumValueInGroup = accumulatedSums[j];
                indexOfMaximum = j;
            }
        }

        // Convert the zero-based index of the maximum sum to a corresponding letter ('A' for 0, 'B' for 1, etc.).
        const resultantCharacter = String.fromCharCode(FIRST_IDENTIFIER_CHAR_CODE + indexOfMaximum);

        // Output the result for the completed group using a template literal for clear formatting.
        console.log(`${resultantCharacter} ${maximumValueInGroup}`);

        // Reset the array of collected sums to begin gathering entries for the next group.
        accumulatedSums = [];

        // Important: According to the original logic, if a group is just processed and reset,
        // the *current* `currentInputLine` (which triggered the group completion check)
        // is *skipped* and not added to the newly reset `accumulatedSums`.
        // The loop will then increment `currentLineIndex` and process the *next* line.
        continue; // Skip the rest of the current loop iteration.
    }

    // If neither termination nor group completion conditions were met,
    // process the current input line to add its sum to the collection.
    // 1. Split the line into parts based on space.
    // 2. Convert each part to a number using `map(Number)`.
    const numericParts = currentInputLine.split(" ").map(Number);

    // Add a robust validation step:
    // Ensure that exactly two numbers were parsed successfully from the line.
    // If not, this line is considered malformed, and we skip it to prevent errors.
    if (numericParts.length !== 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
        // In a production environment, one might log this error. Here, we just skip.
        // console.error(`Warning: Skipping malformed input line "${currentInputLine}" at index ${currentLineIndex}.`);
        continue; // Move to the next line without adding to sums.
    }

    // Calculate the sum of the two valid numbers.
    const calculatedSum = numericParts[0] + numericParts[1];

    // Add the calculated sum to our ongoing collection.
    accumulatedSums.push(calculatedSum);
}

// After the loop finishes, any remaining sums in `accumulatedSums` that didn't form a full group
// are implicitly discarded, consistent with the original script's behavior.
// There is no final output for incomplete groups.