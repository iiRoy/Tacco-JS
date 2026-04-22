/**
 * Processes a series of numerical inputs to determine a specific count for each.
 * This function reads input line by line, interpreting each as a target number.
 * It terminates when a zero (0) is encountered as a target number, or upon encountering
 * non-numeric input, signaling the end of valid data.
 *
 * For each non-zero target number, the function calculates how many distinct sequences
 * of consecutive non-negative integers (starting from some 'a' >= 0, with length 'j' >= 2)
 * sum up precisely to the target number.
 *
 * @param {string} rawSourceData - The raw input string, typically from standard input,
 *                                 containing numbers separated by newline characters.
 */
function analyzeNumberSequences(rawSourceData) {
    // Split the entire input string into an array of individual lines.
    // This allows for sequential access to each test case provided in the input.
    const inputLines = rawSourceData.split('\n');

    // Initialize a pointer to keep track of the current line being processed.
    let currentLinePointer = 0;

    // This primary loop continuously processes test cases until a specific
    // termination condition is met, such as encountering a '0' or invalid input.
    while (true) {
        // Attempt to parse the current line's content into an integer.
        // `Number.parseInt` with a radix of 10 is used to ensure correct parsing
        // and avoid unexpected behavior with leading zeros.
        const currentTargetNumber = Number.parseInt(inputLines[currentLinePointer], 10);

        // --- Input Validation and Termination Checks ---
        // If the parsed value is not a valid number (e.g., empty line, non-numeric string),
        // or if the termination signal (0) is encountered, the processing loop concludes.
        if (isNaN(currentTargetNumber)) {
            // An invalid number suggests either malformed input or the end of the input stream.
            // We exit gracefully in such cases.
            break;
        }

        // The problem specification dictates that a value of '0' serves as the explicit
        // signal to stop processing further test cases.
        if (currentTargetNumber === 0) {
            // Exit the main processing loop when the termination number is found.
            break;
        }
        // --- End of Input Validation ---

        // Initialize a counter for the number of valid sequences found for the current target number.
        // This variable will accumulate the results for the current `currentTargetNumber`.
        let sequenceMatchCount = 0;

        // Iterate through potential lengths of consecutive integer sequences.
        // The sequence length, `potentialSequenceLength` (equivalent to `j` in the original code),
        // must be at least 2. The upper bound is `currentTargetNumber - 1` because if
        // `potentialSequenceLength` were equal to or greater than `currentTargetNumber`,
        // the sum `j*(j-1)/2` would quickly exceed `n` for `a>=0`.
        for (let potentialSequenceLength = 2; potentialSequenceLength < currentTargetNumber; potentialSequenceLength++) {
            // Calculate the sum of the first `potentialSequenceLength - 1` integers.
            // This is represented by the arithmetic series formula `k * (k - 1) / 2`.
            // In the context of the problem, this is the sum of `0 + 1 + ... + (j-1)`,
            // which represents the 'offset' if the sequence started from 'a'.
            const sumOfOffsets = (potentialSequenceLength * (potentialSequenceLength - 1)) / 2;

            // --- Optimization: Early Exit Condition ---
            // If the `sumOfOffsets` alone already exceeds the `currentTargetNumber`,
            // it becomes impossible for `currentTargetNumber - sumOfOffsets` to be non-negative.
            // Since `sumOfOffsets` only increases with `potentialSequenceLength`, there's no
            // need to check larger `potentialSequenceLength` values.
            if (sumOfOffsets > currentTargetNumber) {
                // Terminate the inner loop early for efficiency.
                break;
            }

            // Calculate the remaining value after subtracting the sum of offsets from the target.
            // This `remainingValue` must be a multiple of `potentialSequenceLength` for the
            // sequence's starting term 'a' to be an integer (where `a = remainingValue / potentialSequenceLength`).
            const remainingValue = currentTargetNumber - sumOfOffsets;

            // --- Condition Checks for a Valid Sequence ---
            // 1. The `remainingValue` must be non-negative. (This is implicitly handled by the
            //    `sumOfOffsets > currentTargetNumber` check, but kept explicit for clarity).
            // 2. The `remainingValue` must be perfectly divisible by `potentialSequenceLength`.
            //    This ensures that the first term 'a' of the consecutive sequence is an integer.
            const isNonNegative = remainingValue >= 0;
            const isPerfectlyDivisible = (remainingValue % potentialSequenceLength) === 0;

            // If both conditions are satisfied, a valid sequence of `potentialSequenceLength`
            // consecutive non-negative integers summing to `currentTargetNumber` has been found.
            if (isNonNegative && isPerfectlyDivisible) {
                sequenceMatchCount++;
            }
        }

        // Output the final count for the current target number.
        // `console.info` is used here for a slightly different output channel/style compared to `console.log`.
        console.info(sequenceMatchCount);

        // Increment the line pointer to move to the next test case in the input.
        currentLinePointer++;
    }
}

// The entry point for executing the program.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes this raw data string to
// the main `analyzeNumberSequences` processing function.
analyzeNumberSequences(require("fs").readFileSync("/dev/stdin", "utf8"));