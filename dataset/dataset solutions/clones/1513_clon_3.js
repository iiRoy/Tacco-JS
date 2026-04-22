// A helper method designed to parse a string containing space-separated numeric values
// into an array of JavaScript Number types. It includes basic input sanitization.
const interpretNumericSequence = (textLine) => {
    // Ensure the input string is trimmed of leading/trailing whitespace,
    // then split it by one or more spaces, and finally map each resulting
    // string segment to its numerical representation.
    return textLine.trim().split(/\s+/).map(Number);
};

/**
 * Orchestrates the computation of unique path combinations from a starting
 * position to a target position, given a set of allowed step increments.
 * This function implements a dynamic programming approach.
 *
 * @param {string} rawInputData - The entire input as a single string,
 *                                 where lines are separated by newline characters.
 */
const computePathCombinations = (rawInputData) => {
    // Define the modulus value as a BigInt, which is crucial for
    // preventing integer overflow in large calculations.
    const pathModulus = 998244353n;

    // Pre-define BigInt constants for common numerical values for efficiency and clarity.
    const bigIntZero = 0n;
    const bigIntOne = 1n;

    // Divide the raw input string into an array of individual lines.
    const allInputLines = rawInputData.trim().split('\n');

    // The first line of input provides the maximum target position (N).
    // Use destructuring to extract N and discard any other potential values on that line.
    const [targetFinalPosition] = interpretNumericSequence(allInputLines[0]);

    // Implement a guard clause to validate the target position. It must be
    // a positive integer, as paths cannot exist for non-positive or non-integer targets.
    if (targetFinalPosition <= 0 || !Number.isInteger(targetFinalPosition)) {
        console.error("Input Error: The target position (N) must be a positive integer.");
        // In a production environment, one might throw an exception or handle this more robustly.
        return;
    }

    // Initialize a JavaScript Map to store and count all distinct step sizes
    // derived from the input ranges. A Map is chosen for its clear key-value structure.
    const potentialStepSizesMap = new Map();

    // Iterate through the input lines starting from the second line (index 1),
    // as these lines define the inclusive ranges for possible step sizes.
    for (let currentLineIndex = 1; currentLineIndex < allInputLines.length; ++currentLineIndex) {
        // Parse the current line to get the start and end points of a step range.
        const [rangeLowerBound, rangeUpperBound] = interpretNumericSequence(allInputLines[currentLineIndex]);

        // Validate the extracted range: start must not exceed end, and both must be positive integers.
        // If invalid, log a warning and skip this range to continue processing valid inputs.
        if (rangeLowerBound > rangeUpperBound || rangeLowerBound < 1 || rangeUpperBound < 1 || !Number.isInteger(rangeLowerBound) || !Number.isInteger(rangeUpperBound)) {
             console.warn(`Warning: Detected an invalid step range [${rangeLowerBound}, ${rangeUpperBound}]. This range will be ignored.`);
             continue;
        }

        // For each valid number within the determined range (inclusive),
        // increment its count in the `potentialStepSizesMap`.
        for (let currentStepCandidate = rangeLowerBound; currentStepCandidate <= rangeUpperBound; ++currentStepCandidate) {
            // Use `|| 0` to handle cases where a step candidate is encountered for the first time.
            potentialStepSizesMap.set(currentStepCandidate, (potentialStepSizesMap.get(currentStepCandidate) || 0) + 1);
        }
    }

    // Extract all unique step values (keys) from the map and sort them in ascending order.
    // This sorted list of allowed increments is crucial for efficient DP calculations
    // and for early termination optimizations.
    const availableIncrements = Array.from(potentialStepSizesMap.keys()).sort((valA, valB) => valA - valB);

    // Initialize the dynamic programming table (an array).
    // `waysToReachPosition[k]` will store the total number of distinct ways to reach position `k`.
    // The array is sized `targetFinalPosition + 1` to allow for 0-based indexing up to `targetFinalPosition`.
    // All entries are initialized to `bigIntZero`.
    const waysToReachPosition = new Array(targetFinalPosition + 1).fill(bigIntZero);

    // Define the initial state: we start at position 1.
    const startingPoint = 1;

    // Set the base case for the DP: there is one way to be at the starting position.
    // This assumes the problem implies starting at 1.
    // Include a check to ensure the starting point is within the valid range.
    if (startingPoint <= targetFinalPosition) {
        waysToReachPosition[startingPoint] = bigIntOne;
    } else {
        // If the starting point itself is beyond the target, no paths can exist.
        console.log(`${bigIntZero}`);
        return;
    }

    // Begin the main dynamic programming loop.
    // Iterate from the starting point up to one position before the final target.
    // At each `currentPosition`, we calculate paths leading from it.
    for (let currentPosition = startingPoint; currentPosition < targetFinalPosition; ++currentPosition) {
        // Optimization: If there are no ways to reach `currentPosition`,
        // then no paths can originate from it, so we can skip further calculations for this position.
        if (waysToReachPosition[currentPosition] === bigIntZero) {
            continue;
        }

        // Store the number of ways to reach the `currentPosition` in a temporary variable
        // to avoid repeated array lookups within the inner loop.
        const countFromCurrentPosition = waysToReachPosition[currentPosition];

        // Apply each allowed increment from the `currentPosition`.
        // The `availableIncrements` array is iterated over.
        for (const incrementMagnitude of availableIncrements) {
            const nextCalculatedPosition = currentPosition + incrementMagnitude;

            // Optimization: Since `availableIncrements` is sorted, if `nextCalculatedPosition`
            // exceeds the `targetFinalPosition`, all subsequent `incrementMagnitude` values
            // will also lead beyond the target. Therefore, we can break out of this inner loop.
            if (nextCalculatedPosition > targetFinalPosition) {
                break;
            }

            // Update the DP table: Add the `countFromCurrentPosition` to the
            // `waysToReachPosition` for `nextCalculatedPosition`.
            // Apply the modulus operation at each step to keep numbers manageable.
            waysToReachPosition[nextCalculatedPosition] = (waysToReachPosition[nextCalculatedPosition] + countFromCurrentPosition) % pathModulus;
        }
    }

    // The final result is the total number of ways to reach `targetFinalPosition`,
    // ensuring the result is non-negative and within the modulus range.
    // (The `+ pathModulus` is redundant here since `waysToReachPosition[targetFinalPosition]` will be positive,
    // but it's a robust pattern for general modulo arithmetic).
    const finalPathCount = (waysToReachPosition[targetFinalPosition] % pathModulus + pathModulus) % pathModulus;

    // Output the final calculated result to the console.
    console.log(`${finalPathCount}`);
};


// --- Execution Entry Point ---
// This conditional block determines how the script acquires its input based on environment variables.
// It supports a testing mode and standard input reading for competitive programming platforms.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' // Check if the environment variable 'MYTEST' is explicitly set to 'test'.
      ? test() // If 'MYTEST' is 'test', invoke a placeholder 'test' function (assumed to be defined elsewhere for testing).
      : computePathCombinations(require('fs').readFileSync('dev/stdin', 'utf8')) // Otherwise, read from 'dev/stdin' (common for local development).
    )
  : computePathCombinations(require('fs').readFileSync('/dev/stdin', 'utf8')); // If 'MYTEST' is not set, read from '/dev/stdin' (standard for online judges).