const ioModule = require('readline');

// Collection to store all lines received from standard input.
let receivedInputLines = [];

// Global parameters derived from the first input line.
let gridDimension;  // Corresponds to N in the original problem.
let segmentCount;   // Corresponds to M in the original problem.
let queryCount;     // Corresponds to Q in the original problem.

// The 2D array representing the cumulative sum grid (prefix sum table).
// It will be initialized with dimensions (gridDimension + 1) x (gridDimension + 1)
// to facilitate 1-based indexing for calculations.
let prefixSumTable;

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Handles potential invalid input by returning an empty array.
 * @param {string} inputStr - The string to parse.
 * @returns {Array<number>} An array of parsed numbers.
 */
function parseNumbersFromString(inputStr) {
    if (typeof inputStr !== 'string' || !inputStr.trim()) {
        return []; // Return empty for invalid or empty strings.
    }
    return inputStr.split(' ').map(Number);
}

// Initialize the readline interface to process standard input.
const inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener triggered for each line read from standard input.
inputHandler.on('line', (currentLine) => {
    // Store the trimmed line content.
    receivedInputLines.push(currentLine.trim());
});

// Event listener triggered when the input stream concludes.
inputHandler.on('close', () => {
    // --- Input Validation and Parsing Phase ---

    if (receivedInputLines.length === 0) {
        console.error("Error: No input data provided. Cannot proceed.");
        return;
    }

    // Parse the first line containing the main configuration parameters (N, M, Q).
    const configurationValues = parseNumbersFromString(receivedInputLines[0]);
    if (configurationValues.length < 3) {
        console.error("Error: The first line must contain N, M, and Q values.");
        return;
    }

    gridDimension = configurationValues[0];
    segmentCount = configurationValues[1];
    queryCount = configurationValues[2];

    // Validate the parsed configuration values.
    if (gridDimension <= 0 || segmentCount < 0 || queryCount < 0) {
        console.error("Error: Grid dimension (N) must be positive, and segment/query counts (M, Q) non-negative.");
        return;
    }

    // Initialize the 2D prefix sum table.
    // All cells are set to zero initially.
    prefixSumTable = Array.from({ length: gridDimension + 1 }, () =>
        Array.from({ length: gridDimension + 1 }, () => 0)
    );

    // Arrays to store the coordinates of all segments.
    const segmentStartCoordinates = new Array(segmentCount);
    const segmentEndCoordinates = new Array(segmentCount);

    // Parse all segment definitions.
    // Segments start from the second line (index 1) of the input.
    for (let k = 0; k < segmentCount; ++k) {
        const lineIndex = k + 1;
        if (lineIndex >= receivedInputLines.length) {
            console.error(`Error: Missing definition for segment #${k + 1}.`);
            return;
        }
        const segmentPair = parseNumbersFromString(receivedInputLines[lineIndex]);
        if (segmentPair.length < 2) {
            console.error(`Error: Malformed segment definition on line ${lineIndex + 1}. Expected two numbers.`);
            return;
        }
        segmentStartCoordinates[k] = segmentPair[0];
        segmentEndCoordinates[k] = segmentPair[1];
    }

    // Arrays to hold the range boundaries for each query.
    const queryLowerBounds = []; // Corresponds to p in original.
    const queryUpperBounds = []; // Corresponds to q in original.

    // Parse all query definitions.
    // Queries start after the configuration line and all segment lines.
    const firstQueryLineIndex = 1 + segmentCount;
    for (let k = 0; k < queryCount; ++k) {
        const lineIndex = firstQueryLineIndex + k;
        if (lineIndex >= receivedInputLines.length) {
            console.error(`Error: Missing definition for query #${k + 1}.`);
            return;
        }
        const queryPair = parseNumbersFromString(receivedInputLines[lineIndex]);
        if (queryPair.length < 2) {
            console.error(`Error: Malformed query definition on line ${lineIndex + 1}. Expected two numbers.`);
            return;
        }
        queryLowerBounds.push(queryPair[0]);
        queryUpperBounds.push(queryPair[1]);
    }

    // --- Core Logic Execution Phase ---

    // Populate the cumulative sum grid based on the parsed segments.
    populateCumulativeSumGrid(segmentStartCoordinates, segmentEndCoordinates, gridDimension);

    /**
     * Calculates the sum of elements within a rectangular region of the prefixSumTable.
     * The region is defined by its top-left corner (startRow, startCol) and bottom-right corner (endRow, endCol).
     * All coordinates are assumed to be 1-based, and indices for the table are handled defensively.
     * @param {number} startRow - The 1-based starting row of the region.
     * @param {number} startCol - The 1-based starting column of the region.
     * @param {number} endRow - The 1-based ending row of the region.
     * @param {number} endCol - The 1-based ending column of the region.
     * @returns {number} The cumulative sum within the specified region.
     */
    function retrieveRegionSum(startRow, startCol, endRow, endCol) {
        // Standard 2D prefix sum inclusion-exclusion principle.
        // Accesses to prefixSumTable are guarded to prevent negative indices.

        let currentSum = 0;

        // Add the value at the bottom-right corner of the target rectangle.
        if (endRow >= 0 && endCol >= 0) {
            currentSum += prefixSumTable[endRow][endCol];
        }

        // Subtract the sum of the region directly above the target rectangle.
        const rowBeforeStart = startRow - 1;
        if (rowBeforeStart >= 0 && endCol >= 0) {
            currentSum -= prefixSumTable[rowBeforeStart][endCol];
        }

        // Subtract the sum of the region directly to the left of the target rectangle.
        const colBeforeStart = startCol - 1;
        if (endRow >= 0 && colBeforeStart >= 0) {
            currentSum -= prefixSumTable[endRow][colBeforeStart];
        }

        // Add back the sum of the top-left diagonal region, which was double-subtracted.
        if (rowBeforeStart >= 0 && colBeforeStart >= 0) {
            currentSum += prefixSumTable[rowBeforeStart][colBeforeStart];
        }

        return currentSum;
    }

    // Process each query.
    const computedResults = [];
    for (let k = 0; k < queryCount; ++k) {
        const queryR1 = queryLowerBounds[k];
        const queryC1 = queryLowerBounds[k]; // For the specific problem, C1 is also P.
        const queryR2 = queryUpperBounds[k];
        const queryC2 = queryUpperBounds[k]; // For the specific problem, C2 is also Q.

        // Use the helper function to get the sum for the queried square region.
        const currentQueryResult = retrieveRegionSum(queryR1, queryC1, queryR2, queryC2);
        computedResults.push(currentQueryResult);
    }

    // --- Output Phase ---

    // Print all computed results, each on a new line.
    console.log(computedResults.join('\n'));
});

/**
 * Initializes and computes the 2D prefix sum grid.
 * This function modifies the global `prefixSumTable`.
 * @param {Array<number>} starts - Array of starting coordinates for segments.
 * @param {Array<number>} ends - Array of ending coordinates for segments.
 * @param {number} maxDim - The maximum dimension (N) of the grid.
 */
function populateCumulativeSumGrid(starts, ends, maxDim) {
    // If there are no segments, the table remains all zeros, which is correct.
    if (starts.length === 0) {
        return;
    }

    // First pass: Mark the individual points (segments) in the grid.
    // Each segment (L, R) increments the count at cell (L, R).
    for (let k = 0; k < starts.length; ++k) {
        const currentStart = starts[k];
        const currentEnd = ends[k];

        // Ensure segment coordinates are within the valid grid bounds (1 to maxDim).
        if (currentStart >= 1 && currentStart <= maxDim &&
            currentEnd >= 1 && currentEnd <= maxDim) {
            prefixSumTable[currentStart][currentEnd]++;
        } else {
            // Optionally, log a warning if segment coordinates are out of bounds.
            // console.warn(`Segment coordinates (${currentStart}, ${currentEnd}) are out of grid bounds.`);
        }
    }

    // Second pass: Compute the actual 2D prefix sums.
    // This converts the point counts into cumulative sums for all rectangles
    // starting from (1,1) up to (rowIdx, colIdx).
    // Iteration starts from 1 because index 0 rows/columns are typically base cases (all zeros).
    for (let rowIdx = 1; rowIdx <= maxDim; ++rowIdx) {
        for (let colIdx = 1; colIdx <= maxDim; ++colIdx) {
            // Add the sum from the cell directly above.
            prefixSumTable[rowIdx][colIdx] += prefixSumTable[rowIdx - 1][colIdx];
            // Add the sum from the cell directly to the left.
            prefixSumTable[rowIdx][colIdx] += prefixSumTable[rowIdx][colIdx - 1];
            // Subtract the sum from the top-left diagonal cell to correct for double-counting.
            prefixSumTable[rowIdx][colIdx] -= prefixSumTable[rowIdx - 1][colIdx - 1];
        }
    }
}