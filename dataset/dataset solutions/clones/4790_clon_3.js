const fileSystemModule = require('fs');

// Define constants for the input source path and character encoding.
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

// --- Input Acquisition and Initial Parsing ---

// Synchronously read the entire content from the specified standard input path.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);

// Split the raw content into an array of lines.
const allInputLines = rawInputContent.split('\n');

// Extract the first line, which is expected to contain the two numbers.
// The .shift() method removes the first element from the array and returns it.
const numberPairStrings = allInputLines.shift().split(' ');

// --- Numeric Conversion and Robustness Checks ---

// Retrieve the string representations of the two numbers.
const firstNumberString = numberPairStrings[0];
const secondNumberString = numberPairStrings[1];

// Convert the string representations into actual numeric values.
// Using the explicit Number() constructor for type conversion,
// as an alternative to the implicit type coercion ('* 1') in the original.
const primaryValue = Number(firstNumberString); // Corresponds to original 'x'
const secondaryValue = Number(secondNumberString); // Corresponds to original 'y'

// Type III: Add a basic input validation guard clause.
// Verify that both converted values are indeed valid numbers.
if (isNaN(primaryValue) || isNaN(secondaryValue)) {
    // If any input is not a number, log an error and exit the process.
    console.error("Error: Invalid numeric input provided. Please ensure both values are numbers.");
    process.exit(1); // Terminate with an error status code.
}

// --- Core Logic for Operation Count Calculation ---

// Initialize a counter for the total number of operations.
let totalOperationCount = 0; // Renamed from 'cnt'

// Type III: Introduce boolean flags for enhanced readability and modularity in conditional checks.
const primaryIsPositive = primaryValue > 0;
const primaryIsNegative = primaryValue < 0;

const secondaryIsPositive = secondaryValue > 0;
const secondaryIsNegative = secondaryValue < 0;

// Type III: The original code used an empty 'if (x == y) {}' block.
// This clone simplifies by executing the complex logic only when values are different.
if (primaryValue !== secondaryValue) {
    let preliminaryAdjustment = 0; // A temporary variable to hold initial cost.

    // Type III: Rewriting the nested conditional structure for preliminary adjustment.
    // This section determines an initial cost based on the relative order and signs of numbers.
    if (primaryValue > secondaryValue) {
        // Scenario 1: The primary value is strictly greater than the secondary value.
        // Check for a specific sign combination: positive primary, negative secondary.
        if (primaryIsPositive && secondaryIsNegative) {
            // Example: primary=5, secondary=-3. This usually implies one 'crossing' of zero.
            preliminaryAdjustment = 1;
        } else {
            // All other cases where primaryValue > secondaryValue fall here.
            // These include:
            // - Both values positive (e.g., 5, 3)
            // - Primary value positive, secondary value is zero (e.g., 5, 0)
            // - Primary value is zero, secondary value negative (e.g., 0, -3)
            // - Both values negative, with primary being less negative (e.g., -3, -5)
            // Such scenarios often require a 'two-step' preliminary adjustment.
            preliminaryAdjustment = 2;
        }
    } else { // This branch implies primaryValue < secondaryValue, as equality is handled by the outer 'if'.
        // Scenario 2: The primary value is strictly less than the secondary value.
        // Check for a specific sign combination: negative primary, positive secondary.
        if (primaryIsNegative && secondaryIsPositive) {
            // Example: primary=-3, secondary=5. This also implies one 'crossing' of zero.
            preliminaryAdjustment = 1;
        } else {
            // All other cases where primaryValue < secondaryValue fall here.
            // These include:
            // - Both values positive (e.g., 3, 5)
            // - Primary value negative, secondary value is zero (e.g., -3, 0)
            // - Primary value is zero, secondary value positive (e.g., 0, 5)
            // - Both values negative, with primary being more negative (e.g., -5, -3)
            // These scenarios typically do not require an initial adjustment.
            preliminaryAdjustment = 0;
        }
    }

    // Accumulate the calculated preliminary adjustment into the total count.
    totalOperationCount += preliminaryAdjustment;

    // Type III: Introduce intermediate variables for the absolute values.
    const absolutePrimaryValue = Math.abs(primaryValue);
    const absoluteSecondaryValue = Math.abs(secondaryValue);

    // Type III: Break down the final Math.abs calculation into distinct steps.
    // Calculate the difference between their absolute magnitudes.
    const differenceOfAbsoluteMagnitudes = absolutePrimaryValue - absoluteSecondaryValue;

    // Take the absolute value of this difference.
    const finalAbsoluteDifference = Math.abs(differenceOfAbsoluteMagnitudes);

    // Add this final absolute difference to the running total.
    totalOperationCount += finalAbsoluteDifference;
}

// --- Output the Final Result ---

// Display the computed total number of operations to the console.
console.log(totalOperationCount);