/**
 * Helper function to safely parse a string into an integer.
 * Includes trimming whitespace for robustness.
 *
 * @param {string} stringValue - The string representation of a number.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
const extractNumericalComponent = (stringValue) => {
    // Apply trimming as an intermediate step for cleaner parsing.
    const cleanedString = stringValue.trim();
    // Use parseInt with radix 10 for explicit base.
    return parseInt(cleanedString, 10);
};

/**
 * Main processing function to calculate an adjusted flavor score.
 * This function models a scenario where a sequence of 'apple' flavors is generated,
 * and one specific apple, whose flavor has the smallest absolute value, is removed
 * from the total sum of flavors.
 *
 * @param {string} rawInputStringContent - A single string containing two space-separated
 *                                         integer values:
 *                                         1. The total number of apples in the sequence (N).
 *                                         2. The starting flavor value for the sequence (L).
 */
function calculateAdjustedFlavorScore(rawInputStringContent) {

    // Break down the raw input string into its constituent parts.
    const individualInputParts = rawInputStringContent.split(' ');

    // --- Input Validation & Guard Clauses (Added Fragments) ---
    // Ensure that the expected number of parameters are present.
    if (individualInputParts.length < 2) {
        console.error('Error: Insufficient input provided. Expected two numeric parameters (N and L).');
        // Terminate execution gracefully if input is malformed.
        return;
    }

    // Extract and parse the primary parameters from the input parts.
    // Renamed variables for improved semantic clarity.
    const totalNumberOfApples = extractNumericalComponent(individualInputParts[0]); // Corresponds to original N
    const initialFlavorValue = extractNumericalComponent(individualInputParts[1]);    // Corresponds to original L

    // Validate that parsed values are indeed numbers.
    if (isNaN(totalNumberOfApples) || isNaN(initialFlavorValue)) {
        console.error('Error: Invalid numeric input. Both N and L must be valid integers.');
        return;
    }

    // Validate that the count of apples is positive.
    if (totalNumberOfApples <= 0) {
        console.error('Error: The total number of apples must be a positive integer.');
        return;
    }
    // --- End of Input Validation ---

    // --- Calculate the Cumulative Sum of All Flavors (Updated/Rewritten Statement) ---
    // The sequence of flavors is: initialFlavorValue, initialFlavorValue + 1, ..., initialFlavorValue + totalNumberOfApples - 1.
    // This is an arithmetic progression. The sum can be calculated directly using the formula:
    // Sum = (number of terms / 2) * (first term + last term)
    // First term: initialFlavorValue
    // Last term: initialFlavorValue + totalNumberOfApples - 1
    // Number of terms: totalNumberOfApples
    const lastFlavorValueInSequence = initialFlavorValue + totalNumberOfApples - 1; // Helper variable
    const totalCumulativeFlavorSum = (totalNumberOfApples / 2) * (initialFlavorValue + lastFlavorValueInSequence);


    // --- Identify the Flavor to Be Excluded (Rewritten/Updated Logic) ---
    // We need to find the specific flavor within the sequence whose absolute value
    // is the smallest. This apple is the one to be 'removed' from the total sum.
    let flavorWithMinimumAbsoluteValue = Number.POSITIVE_INFINITY; // Renamed from 'min'
    let currentMinimumAbsoluteValueSeen = Number.POSITIVE_INFINITY; // New helper variable to track absolute minimum

    // Iterate through each potential apple flavor in the sequence.
    // The loop structure is changed to iterate based on an index from 0 to N-1,
    // then calculate the actual flavor value.
    for (let currentAppleIndex = 0; currentAppleIndex < totalNumberOfApples; ++currentAppleIndex) {
        // Calculate the flavor value for the current apple. (Intermediate step)
        const individualAppleFlavor = initialFlavorValue + currentAppleIndex;

        // Determine the absolute value of the current apple's flavor. (Intermediate step)
        const absoluteValueOfCurrentFlavor = Math.abs(individualAppleFlavor);

        // Compare against the smallest absolute value found so far.
        // This comparison logic is a rewrite of the original 'if' statement.
        if (absoluteValueOfCurrentFlavor < currentMinimumAbsoluteValueSeen) {
            currentMinimumAbsoluteValueSeen = absoluteValueOfCurrentFlavor;
            flavorWithMinimumAbsoluteValue = individualAppleFlavor;
        }
        // If absolute values are equal, the original code's behavior (Math.abs(i) < Math.abs(min))
        // means it only updates if strictly smaller, effectively keeping the first encountered
        // value that achieved that minimum absolute value. Our rewritten logic maintains this.
    }

    // --- Final Calculation and Output ---
    // The final adjusted score is the total sum of all flavors
    // minus the flavor identified as having the minimum absolute value.
    const resultantFlavorScore = totalCumulativeFlavorSum - flavorWithMinimumAbsoluteValue;

    // Output the computed result to the console.
    console.log(resultantFlavorScore);
}

// The entry point of the script execution.
// It reads the entire content from standard input (typically '/dev/stdin' in competitive programming contexts)
// and then passes this raw string content to our primary processing function.
calculateAdjustedFlavorScore(require('fs').readFileSync('/dev/stdin', 'utf8'));