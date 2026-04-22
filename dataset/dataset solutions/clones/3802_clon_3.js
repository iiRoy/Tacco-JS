/**
 * @file This script determines the minimum number of orientation changes required
 *       to align a sequence of individuals, where each individual is facing either
 *       West ('W') or East ('E'). The goal is to find a split point such that
 *       all individuals to the left of the split face West, and all individuals
 *       to the right of the split face East, with the minimum number of flips.
 *       This is a Type III code clone, incorporating extensive structural and
 *       stylistic modifications while preserving core functionality.
 */

/**
 * Utility module for file system operations.
 * Renamed from 'fs' to 'systemFileHandler' for clarity and to demonstrate renaming.
 */
const systemFileHandler = require('fs');

/**
 * Defines the standard input file path for this program.
 * Renamed from a literal string '/dev/stdin' and made into a constant for maintainability.
 */
const standardInputPath = '/dev/stdin';

/**
 * Main function to encapsulate the entire logic for calculating minimum orientation changes.
 * Wrapping the core logic in a function is a significant structural addition (Type III modification).
 */
function determineMinimumOrientationChanges() {
    // Read raw input data from the specified path, decode as UTF-8, and split by newline characters.
    // Variable 'inp' has been renamed to 'rawInputLines' and comments added.
    const rawInputLines = systemFileHandler.readFileSync(standardInputPath, 'utf8').split('\n');

    // Basic validation for input data integrity. This is a new guard clause (Type III modification).
    if (!rawInputLines || rawInputLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least two lines (sequence length and direction sequence).");
        // Use a non-zero exit code to indicate an error condition.
        process.exit(1); 
    }

    // Extract the length of the sequence. Convert the string to a number explicitly.
    // Variable 'N' has been renamed to 'sequenceLength'.
    const sequenceLength = Number(rawInputLines.shift());

    // Extract the sequence of directions (e.g., 'W' for West, 'E' for East).
    // Variable 'S' has been renamed to 'directionSequence'.
    const directionSequence = rawInputLines.shift();

    // Validate the parsed sequence length. This is another new guard clause (Type III modification).
    if (isNaN(sequenceLength) || sequenceLength < 0) {
        console.error(`Error: Invalid sequence length: "${sequenceLength}". Must be a non-negative number.`);
        process.exit(1);
    }
    
    // Validate the direction sequence string. This is a new validation (Type III modification).
    if (typeof directionSequence !== 'string' || directionSequence.length !== sequenceLength) {
        console.error(`Error: Direction sequence length mismatch or invalid type. Expected length ${sequenceLength}, got "${directionSequence}" (actual length: ${directionSequence ? directionSequence.length : 'N/A'}).`);
        process.exit(1);
    }

    // Initialize accumulators for counting 'W's and 'E's during the prefix/suffix sum calculations.
    // Variables 'sumW' and 'sumE' have been renamed to 'currentWestwardAccumulator' and 'currentEastwardAccumulator'.
    let currentWestwardAccumulator = 0;
    let currentEastwardAccumulator = 0;

    // Arrays to store prefix sums of 'W's and suffix sums of 'E's.
    // 'westwardPrefixCounts' is sized 'sequenceLength + 1' to store counts for split points from 0 to N.
    // 'eastwardSuffixCounts' is sized 'sequenceLength + 2' to safely handle the E[i+1] array access
    // when 'i' is equal to 'sequenceLength' in the final iteration.
    // Variables 'W' and 'E' have been renamed to 'westwardPrefixCounts' and 'eastwardSuffixCounts'.
    const westwardPrefixCounts = new Array(sequenceLength + 1).fill(0);
    const eastwardSuffixCounts = new Array(sequenceLength + 2).fill(0); // Adjusted size for robustness (Type III modification)

    // Initialize boundary conditions for prefix and suffix sums.
    // 'westwardPrefixCounts[0]' represents the count of 'W's before the first element (which is 0).
    westwardPrefixCounts[0] = 0;
    // 'eastwardSuffixCounts[sequenceLength]' represents the count of 'E's after the last element (which is 0).
    // The additional slot 'eastwardSuffixCounts[sequenceLength + 1]' is also 0 due to 'fill(0)',
    // correctly handling the edge case in the final calculation loop.
    eastwardSuffixCounts[sequenceLength] = 0; 

    // --- First Pass: Calculate Prefix and Suffix Sums ---
    // This loop efficiently populates both prefix 'W' counts and suffix 'E' counts in a single pass.
    // The original logic is preserved but with renamed variables, enhanced comments, and a ternary operator.
    // The loop variable 'i' has been renamed to 'k' for a fresh context within this Type III clone.
    for (let k = 0; k < sequenceLength; k++) {
        // Update westward prefix sum: if the current character at index 'k' is 'W', increment the accumulator.
        // Using a ternary operator instead of an 'if' statement for conciseness (Type III modification).
        currentWestwardAccumulator += (directionSequence[k] === 'W' ? 1 : 0);
        // Store the accumulated 'W' count up to (and including) position 'k' at index 'k+1' in the prefix array.
        westwardPrefixCounts[k + 1] = currentWestwardAccumulator;

        // Update eastward suffix sum: check characters from the right end of the sequence.
        // 'rightIndex' calculates the corresponding index from the right, starting at 'N-1' down to '0'.
        const rightIndex = sequenceLength - 1 - k; // Introduced intermediate variable (Type III modification)
        currentEastwardAccumulator += (directionSequence[rightIndex] === 'E' ? 1 : 0);
        // Store the accumulated 'E' count from position 'rightIndex' to the end of the sequence.
        eastwardSuffixCounts[rightIndex] = currentEastwardAccumulator;
    }

    // Initialize the minimum number of required flips to a very large value.
    // Variable 'min' has been renamed to 'minimumRequiredFlips' and initialized with 'Infinity'
    // for a more robust and standard approach (Type III modification).
    let minimumRequiredFlips = Infinity;

    // --- Second Pass: Determine the Optimal Split Point ---
    // Iterate through all possible division points. A split point 'splitPointIndex'
    // conceptually divides the sequence into 'S[0...splitPointIndex-1]' (left) and 'S[splitPointIndex...N-1]' (right).
    // The loop includes 'splitPointIndex = 0' (all East) and 'splitPointIndex = sequenceLength' (all West).
    // The loop variable 'i' has been renamed to 'splitPointIndex'.
    for (let splitPointIndex = 0; splitPointIndex <= sequenceLength; splitPointIndex++) {
        // Calculate the number of 'W's that need to be flipped to 'E' on the left side of the split.
        // 'westwardPrefixCounts[splitPointIndex]' gives the count of 'W's in S[0...splitPointIndex-1].
        const leftSideWestward = westwardPrefixCounts[splitPointIndex]; // Introduced intermediate variable (Type III modification)

        // Calculate the number of 'E's that need to be flipped to 'W' on the right side of the split.
        // 'eastwardSuffixCounts[splitPointIndex + 1]' gives the count of 'E's in S[splitPointIndex+1...N-1].
        // This access is now safe due to the adjusted size of 'eastwardSuffixCounts'.
        const rightSideEastward = eastwardSuffixCounts[splitPointIndex + 1]; // Introduced intermediate variable (Type III modification)
        
        // Sum the required flips for this specific split point.
        // Introduced an intermediate variable 'totalFlipsForCurrentSplit' for clarity (Type III modification).
        const totalFlipsForCurrentSplit = leftSideWestward + rightSideEastward;

        // Update the minimum required flips if the current split point yields a better result.
        // Using 'Math.min' for conciseness and clarity (Type III modification).
        minimumRequiredFlips = Math.min(minimumRequiredFlips, totalFlipsForCurrentSplit);

        // Optional: Add a debug log for intermediate steps. This is a new fragment (Type III modification).
        // Uncomment the following lines to enable verbose debugging output.
        // if (process.env.DEBUG_MODE === 'true') {
        //    console.debug(`Split at position ${splitPointIndex}: Westward flips left = ${leftSideWestward}, Eastward flips right = ${rightSideEastward}, Total for this split = ${totalFlipsForCurrentSplit}`);
        // }
    }

    // Output the final result to the console.
    // Changed 'console.log' to 'console.info' for semantic difference and Type II/III modification.
    console.info(minimumRequiredFlips);
}

// Execute the main function.
// Wrapped the execution in a try-catch block for robust error handling (Type III modification).
try {
    determineMinimumOrientationChanges();
} catch (error) {
    console.error("An unexpected error occurred during execution:", error.message);
    // Exit with a non-zero status code to indicate failure.
    process.exit(1);
}