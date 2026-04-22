// This module is designed to process structured textual input,
// extract numerical components, and perform a specific combinatorial calculation.

/**
 * A robust utility function to safely convert a string representation into a base-10 integer.
 * It includes basic error handling for non-numeric input.
 *
 * @param {string} stringValue - The string expected to contain an integer.
 * @returns {number} The parsed integer. Returns `NaN` if the string cannot be converted.
 */
const obtainDecimalInteger = (stringValue) => {
    // It's crucial to specify the radix (base) for `parseInt` to prevent unexpected behavior.
    const numericalResult = parseInt(stringValue, 10);

    // Provide a warning if the conversion failed, indicating potential malformed input.
    if (isNaN(numericalResult)) {
        console.warn(`Input parsing issue: "${stringValue}" could not be converted to a valid integer.`);
    }

    return numericalResult;
};

/**
 * Calculates the total number of unique pairs that can be formed from a given set of distinct items.
 * This function effectively computes "n choose 2" (C(n, 2)).
 *
 * @param {number} totalItems - The total quantity of distinct items available.
 * @returns {number} The count of distinct pairs. Returns 0 if `totalItems` is less than 2,
 *                   as at least two items are required to form a pair.
 */
const computeUniquePairCount = (totalItems) => {
    // A guard condition: if there are fewer than two items, no pairs can be formed.
    if (totalItems < 2) {
        return 0;
    }

    // For exactly two items, only one unique pair is possible.
    // While the general formula would yield this, explicit handling can sometimes be clearer.
    if (totalItems === 2) {
        return 1;
    }

    // For three or more items, the formula C(n, 2) = n * (n - 1) / 2 applies.
    // We'll express it slightly differently for a Type III variation.
    const itemsMinusOne = totalItems - 1;
    const product = totalItems * itemsMinusOne;
    const finalPairCount = product / 2;

    // Optional: A defensive check to ensure the result is an integer.
    // For valid integer inputs to C(n,2), the result should always be an integer.
    if (!Number.isInteger(finalPairCount)) {
        console.error(`Calculation anomaly: computeUniquePairCount(${totalItems}) resulted in a non-integer value: ${finalPairCount}`);
    }

    return finalPairCount;
};

/**
 * The primary entry point for processing the entire input dataset.
 * This function orchestrates parsing, validation, calculation, and output.
 *
 * @param {string} completeInputData - The raw, multi-line string input received.
 */
function ProcessInputDataset(completeInputData) {
    // Initial validation: Ensure the input data is a non-empty string.
    if (typeof completeInputData !== 'string' || completeInputData.trim().length === 0) {
        console.error("Execution Aborted: Input data is either missing or not a valid string.");
        return; // Terminate execution if input is invalid.
    }

    // Split the entire input into an array of individual lines.
    const inputLinesArray = completeInputData.split("\n");

    // Validate that there's at least one line of meaningful data.
    if (inputLinesArray.length === 0 || inputLinesArray[0].trim().length === 0) {
        console.error("Execution Aborted: The first line of input, containing the primary numbers, is empty or absent.");
        return;
    }

    // Focus on the first line, which contains the space-separated numbers.
    const firstLineContent = inputLinesArray[0].trim();

    // Divide the first line into string segments based on spaces.
    const numericStringSegments = firstLineContent.split(" ");

    // Essential validation: Confirm that at least two numeric segments are present.
    if (numericStringSegments.length < 2) {
        console.error("Execution Aborted: Insufficient numeric values on the first line. Expected at least two space-separated numbers.");
        return;
    }

    // Parse the first two segments into integers using the helper function.
    const primaryValueA = obtainDecimalInteger(numericStringSegments[0]);
    const primaryValueB = obtainDecimalInteger(numericStringSegments[1]);

    // Further validation: Ensure both parsed values are actual numbers.
    if (isNaN(primaryValueA) || isNaN(primaryValueB)) {
        console.error("Execution Aborted: One or both primary numeric values could not be successfully parsed.");
        return;
    }

    // Compute the pair count for each primary value and sum them up.
    // This represents the core logic of the problem.
    const totalResultingPairs = computeUniquePairCount(primaryValueA) + computeUniquePairCount(primaryValueB);

    // Output the final calculated sum to standard output.
    console.log(totalResultingPairs);
}

// This standard boilerplate code reads the entire content of /dev/stdin
// (standard input) and passes it to our main processing function.
// It should typically remain untouched in competitive programming contexts.
ProcessInputDataset(require("fs").readFileSync("/dev/stdin", "utf8"));