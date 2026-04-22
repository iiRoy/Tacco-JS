const MODULO_VALUE = 1000000007;

/**
 * Computes the number of ways to tile a 1xN space using 1x1 or 1x2 tiles.
 * This corresponds to a modified Fibonacci sequence (F(0)=1, F(1)=1, F(2)=2, F(n)=F(n-1)+F(n-2)).
 *
 * @param {number} corridorLength The length of the corridor segment to tile.
 * @returns {number} The count of distinct tiling configurations, modulo MODULO_VALUE.
 */
function calculateTilingConfigurations(corridorLength) {
    if (corridorLength < 0) {
        // A negative length implies an invalid configuration (e.g., overlapping fixed points).
        // It's not possible to tile a negative length, so return 0.
        return 0;
    }
    if (corridorLength === 0) {
        // There is one way to tile a zero-length space: do nothing (empty tiling).
        return 1;
    }
    if (corridorLength === 1) {
        // There is one way to tile a 1-length space: use a single 1x1 tile.
        return 1;
    }
    if (corridorLength === 2) {
        // There are two ways to tile a 2-length space:
        // 1. Two 1x1 tiles.
        // 2. One 1x2 tile.
        return 2;
    }

    // For lengths greater than 2, use dynamic programming (iterative Fibonacci).
    // We maintain the last two Fibonacci-like numbers to compute the next.
    let f_k_minus_2 = 1; // Corresponds to ways for length k-2
    let f_k_minus_1 = 2; // Corresponds to ways for length k-1

    // Iterate from length 3 up to the target corridorLength.
    for (let currentLen = 3; currentLen <= corridorLength; currentLen++) {
        const f_k = (f_k_minus_1 + f_k_minus_2) % MODULO_VALUE;
        f_k_minus_2 = f_k_minus_1;
        f_k_minus_1 = f_k;
    }

    return f_k_minus_1;
}

/**
 * Checks if any two consecutive fixed blocking points are directly adjacent.
 * If they are, it's impossible to tile the space, as no tile can span the gap.
 *
 * @param {number[]} sortedBlockingPoints An array of 1-indexed blocking point positions, assumed to be sorted.
 * @returns {boolean} True if any adjacent blocking points are found, false otherwise.
 */
function containsAdjacentBlockingPoints(sortedBlockingPoints) {
    // Iterate through the array up to the second-to-last element.
    for (let pointIndex = 0; pointIndex < sortedBlockingPoints.length - 1; pointIndex++) {
        // If the difference between a point and its successor is 1, they are adjacent.
        if (sortedBlockingPoints[pointIndex + 1] - sortedBlockingPoints[pointIndex] === 1) {
            return true; // Found an adjacent pair.
        }
    }
    return false; // No adjacent pairs were found.
}

/**
 * Calculates the lengths of the free, unblocked segments within the grid.
 * These are the spaces where tiling can occur.
 *
 * @param {number} totalDimension The total length of the 1D grid.
 * @param {number[]} sortedBlockingPoints An array of sorted 1-indexed blocking point positions.
 * @returns {number[]} An array of lengths for each free segment.
 */
function determineFreeSegmentLengths(totalDimension, sortedBlockingPoints) {
    const segmentLengthsCollection = [];

    // If there are no blocking points, the entire grid is one free segment.
    if (sortedBlockingPoints.length === 0) {
        segmentLengthsCollection.push(totalDimension);
        return segmentLengthsCollection;
    }

    // Calculate the length of the segment before the first blocking point.
    // The grid starts at position 1.
    segmentLengthsCollection.push(sortedBlockingPoints[0] - 1);

    // Calculate lengths of segments between consecutive blocking points.
    // Each segment's length is `(point_B - point_A) - 2`.
    // The -2 accounts for the two blocking points themselves.
    for (let i = 1; i < sortedBlockingPoints.length; i++) {
        segmentLengthsCollection.push(sortedBlockingPoints[i] - sortedBlockingPoints[i - 1] - 2);
    }

    // Calculate the length of the segment after the last blocking point.
    // The grid ends at `totalDimension`.
    segmentLengthsCollection.push(totalDimension - sortedBlockingPoints[sortedBlockingPoints.length - 1] - 1);

    return segmentLengthsCollection;
}

/**
 * Solves the main tiling problem for a given grid dimension and blocked cell indices.
 *
 * @param {number} gridDimension The total length of the 1D grid (N).
 * @param {number[]} cellBlockers An array of 1-indexed positions that are blocked.
 * @returns {number} The total number of ways to tile the unblocked segments, modulo MODULO_VALUE.
 */
function executeTilingStrategy(gridDimension, cellBlockers) {
    // --- Input Validation and Edge Cases ---
    if (gridDimension <= 0) {
        // A non-positive grid dimension implies no space to tile.
        return 0;
    }
    if (!Array.isArray(cellBlockers)) {
        // Ensure the blockers input is a valid array.
        return 0;
    }

    // Sort the blocking points to ensure correct processing.
    // This also helps in detecting adjacency and calculating segment lengths accurately.
    cellBlockers.sort((a, b) => a - b);

    // Ensure all blocking points are within grid bounds.
    // This is an added robustness check not explicitly in original, but good practice.
    for (const blocker of cellBlockers) {
        if (blocker < 1 || blocker > gridDimension) {
            // A blocking point outside the grid makes the problem ill-defined.
            return 0; // Or throw an error.
        }
    }

    // If there are any adjacent blocking points, no tiling is possible.
    if (containsAdjacentBlockingPoints(cellBlockers)) {
        return 0;
    }

    // --- Core Logic ---
    // Determine the lengths of all free segments where tiles can be placed.
    const freeSegmentLengths = determineFreeSegmentLengths(gridDimension, cellBlockers);

    // Calculate the number of ways to tile each individual free segment.
    // Filter out any negative segment lengths which might arise from very close or overlapping
    // blocking points (though `containsAdjacentBlockingPoints` should catch most such cases).
    const waysForEachSegment = freeSegmentLengths
        .filter(len => len >= 0) // Only consider valid non-negative segment lengths.
        .map(length => calculateTilingConfigurations(length));

    // Multiply the number of ways for each segment together,
    // applying the modulo operation at each step to prevent intermediate overflow.
    let cumulativeWaysProduct = 1;
    for (const segmentWays of waysForEachSegment) {
        cumulativeWaysProduct = (cumulativeWaysProduct * segmentWays) % MODULO_VALUE;
    }

    return cumulativeWaysProduct;
}

/**
 * Primary function to process raw input, parse data, and invoke the solution.
 *
 * @param {string} rawInputString The entire input content read from stdin.
 */
function processRawInputAndSolve(rawInputString) {
    // Trim whitespace and split the input into individual lines.
    const dataLines = rawInputString.trim().split('\n');

    // Parse the first line to get the total grid dimension (N) and the count of blocked cells (M).
    const [totalGridDimension, numberOfBlockedCells] = dataLines[0].split(' ').map(Number);

    // Extract and parse the blocked cell indices from the subsequent lines.
    // We use slice(1, 1 + numberOfBlockedCells) to get exactly M lines following the first.
    const blockedCellPositions = dataLines.slice(1, 1 + numberOfBlockedCells).map(Number);

    // Execute the main problem-solving strategy with the parsed data.
    const finalCalculatedAnswer = executeTilingStrategy(totalGridDimension, blockedCellPositions);

    // Output the final result to standard output.
    console.log(finalCalculatedAnswer);
}

// Entry point: Read input from standard input and initiate the processing.
// This typically uses Node.js 'fs' module for competitive programming environments.
processRawInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));