// This module provides a solution to a specific optimization problem.

/**
 * Calculates the total number of cuts required for a given segment length.
 * @param {number[]} lengths - An array of original segment lengths.
 * @param {number} proposedCutLength - The proposed length for each cut piece.
 * @returns {number} The total number of cuts made across all segments.
 */
function calculateTotalCuts(lengths, proposedCutLength) {
    // If the proposed cut length is zero or negative, it's an invalid state for division.
    // For this problem context, we assume proposedCutLength will always be > 0.
    if (proposedCutLength <= 0) {
        // Returning Infinity signifies that this length is unachievable or requires an infinite number of cuts,
        // which helps in the binary search to move towards larger proposedCutLengths.
        return Infinity;
    }

    let totalCuts = 0;
    for (const currentSegmentLength of lengths) {
        // The original logic for calculating cuts for a segment 'v' and length 'mid' was:
        // let d = Math.floor(v / mid);
        // if (v === d * mid) { d--; }
        // This is equivalent to Math.floor((v - 1) / mid) for v > 0.
        // For example:
        // If v=10, mid=5: d=2, then d=1. Math.floor((10-1)/5) = Math.floor(1.8) = 1.
        // If v=10, mid=3: d=3, no change. Math.floor((10-1)/3) = Math.floor(3) = 3.
        // If v=1, mid=1: d=1, then d=0. Math.floor((1-1)/1) = Math.floor(0) = 0.
        // This formulation correctly counts the number of pieces one can cut,
        // effectively reducing the piece count by one if the original segment
        // is perfectly divisible by the proposed cut length.
        // We only consider positive segment lengths for cuts.
        if (currentSegmentLength > 0) {
            totalCuts += Math.floor((currentSegmentLength - 1) / proposedCutLength);
        }
        // If currentSegmentLength is 0 or negative, it contributes 0 cuts.
    }
    return totalCuts;
}


/**
 * Solves an optimization problem using binary search.
 * The problem involves finding the smallest possible maximum segment length
 * such that a certain number of cuts (or operations) are not exceeded.
 *
 * @param {string} rawData - The raw input string containing problem parameters.
 *   Expected format:
 *   Line 1: "<some_unused_value> <target_operation_count>"
 *   Line 2: "<segment1_length> <segment2_length> ..."
 * @returns {number} The optimal minimum maximum segment length.
 */
function solveProblem(rawData = "") {
    // Ensure input is a string and remove any leading/trailing whitespace.
    const trimmedInput = String(rawData).trim();
    if (!trimmedInput) {
        // Handle cases with empty or malformed input data gracefully.
        console.warn("Input data is empty or consists only of whitespace.");
        return 0; // Returning 0 as a default for no operations or segments.
    }

    const inputLines = trimmedInput.split('\n');

    // Basic validation for expected number of lines.
    if (inputLines.length < 2) {
        console.error("Insufficient input lines. Expected at least 2 lines.");
        return 0;
    }

    // Parse the target operation count from the first line.
    // The first value on the first line is typically ignored in this problem context.
    const parametersLine = inputLines[0].split(' ');
    // Use parseInt with base 10 for explicit integer conversion.
    const targetOperationCount = parseInt(parametersLine[1], 10);

    // Parse the array of segment lengths from the second line.
    const segmentLengths = inputLines[1].split(' ').map(valStr => parseInt(valStr, 10));

    // Initialize binary search bounds.
    // The theoretical lower bound for the possible segment length is 1 (a segment must have positive length).
    let searchLowerBound = 1;
    // The upper bound is the maximum length of any segment in the input array.
    // This value represents the largest possible length if no cuts were made.
    let searchUpperBound = 0;
    if (segmentLengths.length > 0) {
        searchUpperBound = Math.max(...segmentLengths);
    } else {
        // If no segments are provided, no cuts are needed, and the answer could be 0 or undefined.
        // For this problem context, we'll return 0.
        console.warn("No segment lengths provided in the input; returning 0.");
        return 0;
    }

    // This variable will store the best (smallest) valid segment length found so far
    // that satisfies the condition. Initialize with the upper bound, as it's always
    // a valid (though not necessarily optimal) answer if targetOperationCount is non-negative.
    let finalAnswer = searchUpperBound;

    // Perform binary search to find the minimum `proposedLength`
    // that satisfies the condition (total cuts <= targetOperationCount).
    while (searchLowerBound <= searchUpperBound) {
        // Calculate the middle point of the current search range.
        // Using Math.floor for integer division.
        const proposedLength = Math.floor((searchUpperBound + searchLowerBound) / 2);

        // A guard clause: if proposedLength is 0, it's an invalid state for division.
        // This scenario should ideally not be reached if searchLowerBound starts at 1
        // and segmentLengths are positive. However, it's good for robustness.
        if (proposedLength <= 0) {
            // If proposedLength becomes 0 or negative, it means we need to shift our search
            // to at least 1, or handle it as an error. For this problem, we enforce >= 1.
            searchLowerBound = 1; // Ensure lower bound is at least 1.
            continue; // Skip to the next iteration.
        }

        // Calculate the total number of cuts required across all segments
        // for the current proposed length.
        const currentCuts = calculateTotalCuts(segmentLengths, proposedLength);

        // Check if the current proposed length is feasible (i.e., doesn't exceed target cuts).
        if (currentCuts <= targetOperationCount) {
            // If feasible, this `proposedLength` is a potential answer.
            // We store it and try to find an even smaller `proposedLength`
            // by searching in the lower half of the current range.
            finalAnswer = proposedLength;
            searchUpperBound = proposedLength - 1;
        } else {
            // If not feasible (too many cuts), `proposedLength` is too small.
            // We need a larger `proposedLength`, so we search in the upper half.
            searchLowerBound = proposedLength + 1;
        }
    }

    return finalAnswer;
}


// --- Execution environment setup for command-line or direct input ---

// Export the main solver function for modular use or testing purposes.
module.exports.solve = solveProblem;

/**
 * Handles the overall execution flow for command-line or direct input.
 * Reads data, processes it, and prints the result.
 * @param {string} inputData - The raw input data string.
 */
function executeSolution(inputData) {
    // Trim any leading/trailing whitespace from the input data before processing.
    const processedInput = inputData.trim();
    const result = solveProblem(processedInput);
    console.log(result);
}

// This block checks if the script is being run directly from the command line
// (i.e., not imported as a module by another script) and if it's not in a specific test mode.
if (process.argv[2] !== "test_mode_enabled") {
    // Attempt to read input from standard input (/dev/stdin).
    // A try-catch block is used for robust error handling during file system operations.
    try {
        const fileSystem = require("fs");
        const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        executeSolution(stdInputContent);
    } catch (error) {
        // Log any errors encountered during file reading or execution.
        console.error("An error occurred while reading from stdin or executing the solution:", error.message);
        // Exit the process with a non-zero status code to indicate failure.
        process.exit(1);
    }
}