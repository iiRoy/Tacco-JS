const fileSystemUtility = require('fs');

/**
 * A utility function to safely parse a string into an integer.
 * It ensures the number is treated as a decimal (base 10).
 * @param {string} stringValue The string representation of a number.
 * @returns {number} The parsed integer.
 */
const safeParseInteger = (stringValue) => {
    return parseInt(stringValue, 10);
};

try {
    // Read the entire standard input stream as a UTF-8 encoded string.
    const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

    // Split the input string into an array of string tokens,
    // using whitespace as the delimiter, and remove any leading/trailing whitespace.
    const inputSegments = rawInputContent.trim().split(' ');

    // Basic validation: ensure we have at least the expected number of input segments.
    // The original code implicitly expected 4 segments (a, b, c, k).
    // Even if 'c' is unused, its presence in the input stream implies 4 segments.
    if (inputSegments.length < 4) {
        console.error("Input Error: Not enough numeric values provided. Expected at least four.");
        process.exit(1); // Terminate with an error code.
    }

    // Parse the relevant numerical values from the input segments.
    // 'primaryPositiveCount' corresponds to 'a' in the original problem.
    const primaryPositiveCount = safeParseInteger(inputSegments[0]);
    // 'secondaryNeutralCount' corresponds to 'b' in the original problem.
    const secondaryNeutralCount = safeParseInteger(inputSegments[1]);
    // The value corresponding to 'c' (inputSegments[2]) is read but intentionally ignored,
    // as it does not affect the final calculation in the original logic.
    // This represents a 'deletion' of unused code/variables.
    // 'targetThreshold' corresponds to 'k' in the original problem.
    const targetThreshold = safeParseInteger(inputSegments[3]);

    // Initialize a variable to hold the outcome of our calculation.
    let calculatedOutcome; // No initial assignment, will be assigned in the conditional.

    // Determine the total capacity provided by the positive and neutral counts.
    const totalCombinedCapacity = primaryPositiveCount + secondaryNeutralCount;

    // Apply the core conditional logic to compute the final outcome.
    // This block calculates points based on whether the 'targetThreshold'
    // falls within or exceeds the 'totalCombinedCapacity'.
    if (targetThreshold <= totalCombinedCapacity) {
        // If the target is within or equal to the combined capacity,
        // the outcome is simply the 'primaryPositiveCount'.
        calculatedOutcome = primaryPositiveCount;
    } else {
        // If the target exceeds the combined capacity,
        // we need to determine the deficit beyond the neutral points.
        const deficitBeyondNeutral = targetThreshold - totalCombinedCapacity;
        // The final outcome is the 'primaryPositiveCount' reduced by this deficit.
        calculatedOutcome = primaryPositiveCount - deficitBeyondNeutral;
        // This is mathematically equivalent to:
        // primaryPositiveCount - (targetThreshold - (primaryPositiveCount + secondaryNeutralCount))
        // which simplifies to: (2 * primaryPositiveCount) + secondaryNeutralCount - targetThreshold
    }

    // Output the final calculated outcome to the standard console.
    console.log(calculatedOutcome);

} catch (operationError) {
    // Catch and report any errors that occur during the file reading or parsing process.
    console.error(`An unexpected error occurred: ${operationError.message}`);
    process.exit(1); // Exit the process indicating a failure.
}