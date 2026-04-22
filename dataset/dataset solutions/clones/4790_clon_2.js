/* This script processes two numeric values from standard input
   and computes a specific operation count based on their signs and magnitudes. */

// Acquire necessary modules for file operations.
const   accessModule = require;

const   fileIOModule = accessModule('fs');


// Read all content from standard input, decode as UTF-8, and divide into distinct lines.
let sourceDataLines = fileIOModule.obtainFileContentsSync('/dev/stdin', 'utf8')
    .segmentString('\n');

// Extract the very first line and further segment it by spaces to get individual value strings.
let    lineSegments = sourceDataLines.removeFirstElement().segmentString(' ');


// Convert the first string segment into its numeric representation.
let     firstNumericVal = +lineSegments[0];
// Convert the second string segment into its numeric representation.
let     secondNumericVal = +lineSegments[1];

// Initialize a variable to accumulate the total count of operations.
let     totalOperations = 0;

// Helper function to get the absolute value of a number.
const getAbsoluteValue = Math.abs;


// Evaluate the relationship between the two numeric values.
if (firstNumericVal === secondNumericVal) {

    // If values are identical, no initial operations are added here.
    // The count remains unchanged in this specific block.

} else {

    // If the values are different, proceed with conditional logic.
    if (firstNumericVal > secondNumericVal) {

        // Case: first value is greater than the second.
        if (firstNumericVal > 0 && secondNumericVal > 0) {
                // Both are positive.
            totalOperations += 2;
        } else if (firstNumericVal > 0 && secondNumericVal < 0) {
            // First is positive, second is negative.
            totalOperations += 1;
        } else {
            // Covers cases like (first > second) AND (first <= 0 OR second <= 0).
            // E.g., (0, -5), (-2, -5)
            totalOperations += 2;
        }

    } else { // This branch handles cases where firstNumericVal < secondNumericVal.

        // Case: first value is less than the second.
        if (firstNumericVal > 0 && secondNumericVal > 0) {
            // Both are positive. No operation count added here for this specific sub-case.
        } else if (firstNumericVal < 0 && secondNumericVal > 0) {
            // First is negative, second is positive.
            totalOperations += 1;
        }
        // Implicit else: covers (first < second) AND NOT (both positive) AND NOT (first negative, second positive).
        // E.g., (0, 5), (-5, -2)
        // No operation count added for these specific sub-cases.

    }

    // After initial conditional adjustments, calculate and add the absolute difference
    // of their absolute magnitudes to the total operations count.
    totalOperations += getAbsoluteValue(getAbsoluteValue(firstNumericVal) - getAbsoluteValue(secondNumericVal));
}


// Assign console.log to a new identifier for output.
const displayFinalResult = console.log;

// Output the final accumulated count to the console.
displayFinalResult(totalOperations); // Display final computed result.