"use strict";

// Main function to orchestrate the problem-solving process.
// It takes the raw input data as a single string.
function processProblemSolution(inputPayload) {
    // Initialize a specialized parser to handle tokenized input.
    let dataFeeder = new StreamDataProcessor(inputPayload);

    // Read the fundamental parameters from the input stream.
    // primaryDimensionSize: Denotes the upper limit for coordinates (often 'N').
    // initialOperationCount: Specifies the number of initial data points or operations (often 'M').
    // totalQueryCount: Indicates how many queries need to be processed (often 'Q').
    const primaryDimensionSize = dataFeeder.getNextIntegerToken();
    const initialOperationCount = dataFeeder.getNextIntegerToken();
    const totalQueryCount = dataFeeder.getNextIntegerToken();

    // --- Type III Addition: Basic input validation ---
    // Ensure that core dimensions and counts are non-negative.
    if (primaryDimensionSize < 0 || initialOperationCount < 0 || totalQueryCount < 0) {
        console.error("Critical error: Input parameters (dimensions/counts) must be non-negative.");
        return; // Terminate execution due to invalid input.
    }

    // Initialize a 2D array (grid) to store cumulative frequency data.
    // This structure is designed for 1-based indexing, so its dimensions are (N+1) x (N+1).
    // All cells are initially set to zero.
    let cumulativeGridData = [];
    for (let rowIdx = 0; rowIdx <= primaryDimensionSize; rowIdx++) {
        const row = new Array(primaryDimensionSize + 1).fill(0);
        cumulativeGridData.push(row);
    }

    // --- Type III Update: Processing initial operations with explicit increment ---
    // Iterate through each of the 'initialOperationCount' operations.
    // Each operation specifies a pair of coordinates (leftRangeCoord, rightRangeCoord).
    // The value at cumulativeGridData[leftRangeCoord][rightRangeCoord] is incremented.
    for (let opIndex = 0; opIndex < initialOperationCount; opIndex++) {
        const leftRangeCoord = dataFeeder.getNextIntegerToken();
        const rightRangeCoord = dataFeeder.getNextIntegerToken();

        // --- Type III Addition: Coordinate bounds check for robustness ---
        // Only process operations if coordinates fall within the defined grid boundaries.
        const isValidLeft = leftRangeCoord >= 1 && leftRangeCoord <= primaryDimensionSize;
        const isValidRight = rightRangeCoord >= 1 && rightRangeCoord <= primaryDimensionSize;

        if (isValidLeft && isValidRight) {
            cumulativeGridData[leftRangeCoord][rightRangeCoord] = cumulativeGridData[leftRangeCoord][rightRangeCoord] + 1;
        } else {
            // In a real-world scenario, one might log this or throw an error.
            // For competitive programming, inputs are usually guaranteed valid.
            // console.warn(`Skipping operation due to out-of-bounds coordinates: (${leftRangeCoord}, ${rightRangeCoord})`);
        }
    }

    // --- Type III Update: Comprehensive 2D prefix sum calculation ---
    // This phase transforms the grid from point-wise counts to cumulative region sums.
    // After this, cumulativeGridData[r][c] will contain the sum of all initial operations (x,y)
    // where x <= r and y <= c.
    for (let rowIterator = 1; rowIterator <= primaryDimensionSize; rowIterator++) {
        for (let colIterator = 1; colIterator <= primaryDimensionSize; colIterator++) {
            // The current count at this specific (row, col) from the initial operations.
            const currentCellCount = cumulativeGridData[rowIterator][colIterator];

            // Fetch the cumulative sums from the adjacent cells (above, left, and diagonal).
            // These represent sums of regions that partially overlap the current region.
            const sumFromAboveRegion = cumulativeGridData[rowIterator - 1][colIterator];
            const sumFromLeftRegion = cumulativeGridData[rowIterator][colIterator - 1];
            const sumFromDiagonalRegion = cumulativeGridData[rowIterator - 1][colIterator - 1];

            // Apply the 2D prefix sum formula (inclusion-exclusion principle):
            // Sum(R, C) = Current_Count(R, C) + Sum(R-1, C) + Sum(R, C-1) - Sum(R-1, C-1)
            // This correctly accounts for overlaps and ensures each point is counted once.
            cumulativeGridData[rowIterator][colIterator] =
                currentCellCount + sumFromAboveRegion + sumFromLeftRegion - sumFromDiagonalRegion;
        }
    }

    // --- Type III Addition: Buffer for collecting all query results ---
    // Instead of printing immediately, collect all results and print them at once.
    const collectedQueryResults = [];

    // Process each of the 'totalQueryCount' queries.
    // Each query (queryStartPoint, queryEndPoint) asks for the sum of initial operations (l, r)
    // such that queryStartPoint <= l <= queryEndPoint AND r <= queryEndPoint.
    // This corresponds to a rectangular region defined by (queryStartPoint, 1) to (queryEndPoint, queryEndPoint).
    for (let queryIndex = 0; queryIndex < totalQueryCount; queryIndex++) {
        const queryStartPoint = dataFeeder.getNextIntegerToken(); // Corresponds to 'p' in original code
        const queryEndPoint = dataFeeder.getNextIntegerToken();   // Corresponds to 'q' in original code

        // --- Type III Addition: Query parameter validation ---
        // Check if query points are within bounds and logically consistent.
        if (queryStartPoint < 1 || queryEndPoint > primaryDimensionSize || queryStartPoint > queryEndPoint) {
            collectedQueryResults.push("QUERY_ERROR: Invalid range"); // Indicate an error
            continue; // Skip to the next query.
        }

        // --- Type III Update: Calculation using intermediate variables for clarity ---
        // 1. Get the cumulative sum for the region up to (queryEndPoint, queryEndPoint).
        // This includes all (x,y) where x <= queryEndPoint and y <= queryEndPoint.
        const totalSumUpToQueryEnd = cumulativeGridData[queryEndPoint][queryEndPoint];

        // 2. Get the cumulative sum for the region up to (queryStartPoint - 1, queryEndPoint).
        // This includes all (x,y) where x < queryStartPoint and y <= queryEndPoint.
        // This is the part we need to exclude from 'totalSumUpToQueryEnd'.
        const sumToExcludeBeforeStart = cumulativeGridData[queryStartPoint - 1][queryEndPoint];

        // The result is the difference, representing the sum of (x,y) where
        // queryStartPoint <= x <= queryEndPoint and y <= queryEndPoint.
        const finalQueryResult = totalSumUpToQueryEnd - sumToExcludeBeforeStart;
        collectedQueryResults.push(finalQueryResult);
    }

    // --- Type III Update: Single print operation for all results ---
    // Join all collected results with newline characters and print them to the console.
    console.log(collectedQueryResults.join('\n'));
}

/**
 * A utility class responsible for robustly parsing numerical tokens from a raw input string.
 * It manages the state of the input stream (current token index).
 */
class StreamDataProcessor {
    // Constructor initializes the parser with the full input string.
    constructor (inputString) {
        // --- Type III Addition: Input type validation ---
        if (typeof inputString !== 'string') {
            throw new Error("StreamDataProcessor constructor expects a string as input.");
        }

        // Split the input string into an array of tokens using whitespace or newlines as delimiters.
        // --- Type III Addition: Filter out empty strings from splitting ---
        // This handles cases with multiple consecutive delimiters or leading/trailing whitespace.
        this.inputTokens = inputString.split(/[\n\s]+/).filter(token => token !== '');
        this.tokenIndex = 0; // Pointer to keep track of the next token to be read.
    }

    /**
     * Retrieves and converts the next available token from the stream into an integer.
     * @returns {number} The integer value of the next token.
     * @throws {Error} If an attempt is made to read beyond the end of the input stream.
     */
    getNextIntegerToken() {
        // --- Type III Addition: Bounds check for reading tokens ---
        if (this.tokenIndex >= this.inputTokens.length) {
            throw new Error("Input stream exhausted: No more tokens available to read.");
        }
        // Fetch the current token and then advance the pointer to the next token.
        const currentToken = this.inputTokens[this.tokenIndex++];
        // --- Type III Update: Explicit Number conversion for clarity ---
        return Number(currentToken);
    }

    // --- Type III Deletion: Removed unused methods ---
    // The original class contained getIntArray, getStr, and getStrArray which were not utilized
    // by the Main function. These have been removed to reduce code bloat.
}

// Environment-specific execution block for Node.js.
// This ensures the solution runs correctly when executed via 'node' command,
// reading input from standard input (stdin).
if (typeof window === "undefined") {
    // --- Type III Update: Renamed Main to processProblemSolution ---
    // Read the entire content of the standard input file synchronously.
    // Specify UTF-8 encoding to correctly handle various text inputs.
    const rawStandardInput = require("fs").readFileSync("/dev/stdin", "utf8");
    // Invoke the primary solution function with the collected input data.
    processProblemSolution(rawStandardInput);
}