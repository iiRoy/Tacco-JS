/**
 * Converts a string of space-separated numbers into an array of integers.
 * @param {string} inputLine The string containing numbers.
 * @param {string} [separator=' '] The delimiter character.
 * @returns {number[]} An array of parsed integers.
 */
function parseSpaceSeparatedIntegers(inputLine, separator = ' ') {
    if (!inputLine || inputLine.trim() === '') {
        return []; 
    }
    return inputLine.split(separator).map(s => {
        const parsed = parseInt(s, 10);
        if (isNaN(parsed)) {
            console.warn(`Warning: Encountered non-numeric value "${s}". Defaulting to 0.`);
            return 0; 
        }
        return parsed;
    });
}

/**
 * Converts a string of space-separated numbers into an array of BigInts.
 * @param {string} inputLine The string containing numbers.
 * @param {string} [separator=' '] The delimiter character.
 * @returns {BigInt[]} An array of parsed BigInts.
 */
function parseSpaceSeparatedBigInts(inputLine, separator = ' ') {
    if (!inputLine || inputLine.trim() === '') {
        return [];
    }
    return inputLine.split(separator).map(s => BigInt(s));
}

/**
 * Transforms an array of strings (each representing a line) into a 2D array of strings.
 * @param {string[]} lines An array where each element is a string line.
 * @param {string} [separator=' '] The delimiter character used to split each line.
 * @returns {string[][]} A 2D array of strings.
 */
function convertLinesToGrid(lines, separator = ' ') {
    return lines.map(line => line.split(separator));
}

/**
 * Calculates the sum of all numbers in an array.
 * @param {number[]} numbers An array of numbers.
 * @returns {number} The total sum.
 */
function calculateArraySum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return 0;
    }
    return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

/**
 * Processes the raw input string to determine minimum moves for a grid pathfinding problem.
 * Finds the minimum number of steps to reach each row by moving right or down,
 * avoiding specified horizontal exclusion zones.
 * @param {string} inputPayload The complete input string received.
 */
function processGridPathfinding(inputPayload) {
    // Split the entire input into individual lines, filtering out any empty lines.
    const inputLines = inputPayload.split("\n").filter(line => line.trim() !== '');

    // The first line contains grid dimensions (height and width).
    const [ gridDimensionsLine, ...exclusionDefinitionLines ] = inputLines;

    // Parse grid dimensions from the first line.
    const [ gridHeight, gridWidth ] = parseSpaceSeparatedIntegers(gridDimensionsLine);

    // --- Input validation for grid dimensions ---
    if (gridHeight <= 0 || gridWidth <= 0) {
        console.error("Error: Grid dimensions (height and width) must be positive integers.");
        return; 
    }
    if (gridHeight > 10000 || gridWidth > 10000) { // Example arbitrary upper limit
        console.warn("Warning: Grid dimensions are very large, performance may be affected.");
    }

    // Convert exclusion definition lines into a 2D array of numbers.
    // Each inner array `[start, end]` defines a forbidden horizontal range for a specific row.
    const exclusionZoneData = exclusionDefinitionLines.map(line => 
        parseSpaceSeparatedIntegers(line)
    );

    // The original problem structure often uses 1-indexed rows.
    // To align `exclusionZoneData` with 1-indexed `currentRowPosition`,
    // we prepend a `null` placeholder at index 0.
    exclusionZoneData.unshift(null);

    /**
     * Stores the minimum number of steps required to reach each row.
     * `minMovesToReachRow[i]` holds the minimum steps to reach row `i+1` (since `minMovesToReachRow` is 0-indexed, and problem rows are 1-indexed).
     * Initialized with -1 to indicate that a row has not yet been reached by any path.
     * @type {number[]}
     */
    let minMovesToReachRow = new Array(gridHeight).fill(-1);

    // Iterate through each possible starting column in the first row (1-indexed).
    for (let startingColumn = 1; startingColumn <= gridWidth; startingColumn++) {
        let currentColumnPosition = startingColumn;
        let currentRowPosition = 1; // Rows are 1-indexed for the problem domain.
        let pathStepCounter = 0; // Counts the number of moves taken in the current path.

        // Simulate path traversal from the current `startingColumn`.
        // The path continues as long as `currentColumnPosition` remains within grid boundaries.
        while (currentColumnPosition <= gridWidth) {
            pathStepCounter++;

            // Local helper function to determine if a downward move is permitted from (col, row).
            // This function checks against the `exclusionZoneData` captured from the outer scope.
            const canMoveVertically = (col, row) => {
                // First, check if the row index is valid and if exclusion data exists for it.
                // If `row` is out of bounds or `exclusionZoneData[row]` is `null` or `undefined`,
                // it implies no specific exclusion rule for this row, so a vertical move is allowed.
                if (row < 1 || row >= exclusionZoneData.length || !exclusionZoneData[row]) {
                    return true; 
                }
                const [rangeStart, rangeEnd] = exclusionZoneData[row];
                // A vertical move is forbidden if the current column position falls within the exclusion range.
                return !(col >= rangeStart && col <= rangeEnd);
            };

            // Decision logic: Prioritize moving down if possible, otherwise move right.
            if (canMoveVertically(currentColumnPosition, currentRowPosition)) {
                currentRowPosition++; // Move to the next row (downwards).

                // If a new row has been reached, update its minimum step count.
                // `minMovesToReachRow` is 0-indexed, so `currentRowPosition - 1` maps to the correct index.
                const targetRowArrayIdx = currentRowPosition - 1;

                // Ensure the calculated index is within the bounds of `minMovesToReachRow`.
                if (targetRowArrayIdx >= 0 && targetRowArrayIdx < gridHeight) {
                    // Update only if this is the first time reaching this row OR if the current path is shorter.
                    if (minMovesToReachRow[targetRowArrayIdx] === -1 || pathStepCounter < minMovesToReachRow[targetRowArrayIdx]) {
                        minMovesToReachRow[targetRowArrayIdx] = pathStepCounter;
                    }
                }
            } else {
                currentColumnPosition++; // Move to the next column (rightwards).
            }

            // If the path has moved beyond the grid's right boundary, this path segment is complete.
            if (currentColumnPosition > gridWidth) {
                break; // Exit the inner path traversal loop.
            }

            // --- Safety break to prevent excessively long or infinite loops ---
            // This can occur in grids with complex exclusion patterns.
            const maxAllowedSteps = gridHeight * gridWidth * 3; // An arbitrary large upper bound.
            if (pathStepCounter > maxAllowedSteps) {
                console.warn(`Path from starting column ${startingColumn} exceeded ${maxAllowedSteps} steps. Terminating this path segment.`);
                break;
            }
        }
    }

    // Output the final array of minimum moves for each row.
    // The problem context implies logging the array directly.
    console.log(minMovesToReachRow);
}

// --- Standard input/output handling. This section should not be altered. ---
processGridPathfinding(require("fs").readFileSync("/dev/stdin", "utf8"));