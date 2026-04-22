const fileSystemInterface = require("fs"); // Renamed require("fs") to a variable for clarity.

// Helper function to robustly convert a string to a number.
// This adds a small utility fragment that wasn't explicitly in the original.
const convertStringToInteger = (stringValue) => {
    // Using Number() for type conversion, which is often preferred over parseInt()
    // for its stricter behavior with non-numeric characters at the end of a string.
    const numericValue = Number(stringValue);
    // Basic validation: if conversion fails, return 0 as a fallback.
    // For competitive programming inputs are usually guaranteed valid,
    // but this is an added fragment for robustness.
    if (isNaN(numericValue)) {
        console.warn(`Warning: Non-numeric input encountered: "${stringValue}". Defaulting to 0.`);
        return 0; // A deleted fragment could be to throw an error here.
    }
    return numericValue;
};

// --- Input Data Acquisition and Preprocessing ---

// Read the raw content from standard input, specified as UTF-8 encoding.
const rawContentBuffer = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

// Split the entire input content into individual lines.
const allContentLines = rawContentBuffer.split("\n");

// A guard clause: ensure there's at least a second line of input.
// This is an added fragment for robustness.
if (allContentLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines.");
    // Exit or handle error gracefully. For this problem, we'll assume valid input.
    process.exit(1); // Added exit fragment.
}

// Extract the second line (index 1) which contains the space-separated numbers.
// Apply trim() to remove potential leading/trailing whitespace (an update to processing).
const dataStringSequence = allContentLines[1].trim();

// Split the string of numbers by space to get an array of stringified numbers.
// Filter out any empty strings that might result from multiple spaces (an update/refinement).
const stringifiedNumberArray = dataStringSequence.split(" ").filter(s => s !== '');

// Convert the array of string numbers into an array of actual numbers using the helper.
const processedNumericSequence = stringifiedNumberArray.map(convertStringToInteger);

/**
 * Calculates the minimum number of operations required to make a sequence of cumulative sums
 * alternate in sign, starting with a specified initial state.
 *
 * The 'initialTargetIsNegative' parameter determines the desired sign for the *first* sum.
 * If true, the first sum should ideally be negative. If false, it should ideally be positive.
 * The logic then forces sums to alternate signs: if current target is negative, next target is positive, and vice-versa.
 *
 * @param {boolean} initialTargetIsNegative - True if the first sum should be forced negative, false for positive.
 * @returns {number} The total count of adjustment operations.
 */
function calculateAlternatingSumAdjustments(initialTargetIsNegative) {
    // Early exit / guard clause for an empty input sequence.
    // This is an added fragment to handle edge cases gracefully.
    if (!processedNumericSequence || processedNumericSequence.length === 0) {
        return 0;
    }

    let currentCumulativeSum = 0;     // Renamed from 'acc'
    let totalModificationCount = 0;   // Renamed from 'cnt'
    // This variable directly reflects the target sign for the *current* cumulative sum.
    // If true, the current sum should be forced to be negative. If false, forced to be positive.
    let targetSignShouldBeNegative = initialTargetIsNegative; // Renamed from 'p'

    // Iterate through each numeric element in the preprocessed sequence.
    for (let currentNumericElement of processedNumericSequence) { // Renamed from 'i', changed to 'let' for consistency
        currentCumulativeSum += currentNumericElement; // Accumulate the sum.

        // Variables for breaking down the adjustment logic (added intermediate steps).
        let adjustmentIsRequired = false;
        let costOfAdjustment = 0;
        let sumAfterForcedAdjustment = 0;

        if (targetSignShouldBeNegative) {
            // Original logic: if (p) { if (acc >= 0) { ... } }
            // This means: if current target is negative, and sum is non-negative (0 or positive),
            // then we need to adjust it to be negative (-1).
            if (currentCumulativeSum >= 0) {
                adjustmentIsRequired = true;
                // Calculate the amount to add/subtract to make the sum exactly -1 (largest negative integer).
                // Original: cnt += 1 + acc;
                costOfAdjustment = 1 + currentCumulativeSum;
                sumAfterForcedAdjustment = -1; // Original: acc = -1;
            }
        } else { // targetSignShouldBePositive
            // Original logic: else { if (acc <= 0) { ... } }
            // This means: if current target is positive, and sum is non-positive (0 or negative),
            // then we need to adjust it to be positive (1).
            if (currentCumulativeSum <= 0) {
                adjustmentIsRequired = true;
                // Calculate the amount to add to make the sum exactly 1 (smallest positive integer).
                // Original: cnt += 1 - acc;
                costOfAdjustment = 1 - currentCumulativeSum;
                sumAfterForcedAdjustment = 1; // Original: acc = 1;
            }
        }

        // Apply adjustments if a violation was detected.
        if (adjustmentIsRequired) {
            totalModificationCount += costOfAdjustment;
            currentCumulativeSum = sumAfterForcedAdjustment; // Reset the cumulative sum to the target value.
        }

        // Toggle the desired target sign for the next iteration.
        // This is a rephrased version of 'p = !p'.
        targetSignShouldBeNegative = !targetSignShouldBeNegative;
    }

    return totalModificationCount;
}

// --- Main Execution Logic ---

// Calculate the adjustments required if the sequence starts by forcing the first sum negative.
const operationsForStartingNegative = calculateAlternatingSumAdjustments(true);

// Calculate the adjustments required if the sequence starts by forcing the first sum positive.
const operationsForStartingPositive = calculateAlternatingSumAdjustments(false);

// Determine the overall minimum cost between the two starting scenarios.
// Using a new intermediate variable for clarity before logging.
const overallMinimumOperations = Math.min(operationsForStartingNegative, operationsForStartingPositive);

// Output the final result to the console.
console.log(overallMinimumOperations);