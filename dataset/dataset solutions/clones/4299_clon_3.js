process.stdin.resume(); // Ensure the standard input stream stays open for data.
process.stdin.setEncoding('utf8'); // Set the character encoding for incoming data.

/**
 * A buffer to accumulate all incoming data from stdin.
 * It's crucial for processing the entire input once the stream ends.
 */
let incomingDataAccumulator = '';

// Event listener for incoming data chunks.
// Each chunk is appended to our data accumulator.
process.stdin.on('data', (dataChunk) => {
    incomingDataAccumulator += dataChunk;
});

/**
 * Parses a string line containing space-separated numeric values into an array of numbers.
 * Handles leading/trailing whitespace and ensures each segment is converted to a number.
 *
 * @param {string} textLine The input string to parse.
 * @returns {number[]} An array of numbers extracted from the line. Returns an empty array for invalid input.
 */
const extractNumbersFromString = (textLine) => {
    // Input validation: return an empty array if the line is null, undefined, or just whitespace.
    if (!textLine || typeof textLine !== 'string' || textLine.trim().length === 0) {
        // console.warn("Attempted to parse an empty or invalid line. Returning empty array.");
        return [];
    }

    // Use trim() for robust whitespace removal, then split by one or more spaces.
    // filter(Boolean) removes any empty strings that might result from multiple spaces.
    const stringSegments = textLine.trim().split(/\s+/).filter(Boolean);

    // Convert each string segment to a number.
    const numericArray = stringSegments.map(Number);

    // Basic validation for parsed numbers (optional, but good practice).
    // If any conversion resulted in NaN, it indicates non-numeric input.
    if (numericArray.some(isNaN)) {
        // console.error(`Found non-numeric values in line: "${textLine}". Result may be unreliable.`);
        // Depending on requirements, could throw error, filter NaNs, or return empty.
        // For this clone, we'll proceed with potential NaNs as per original's behavior.
    }

    return numericArray;
};

// Define constants for cell types to improve readability and maintainability.
const UNEXPLORED_CELL_SYMBOL = '.';
const HAZARD_CELL_SYMBOL = '#';

// Event listener for the 'end' of the input stream.
// This is where the main processing logic begins after all data has been received.
process.stdin.on('end', () => {
    // Split the accumulated input into individual lines.
    // Filter out any completely empty lines that might result from extra newlines.
    const allInputRows = incomingDataAccumulator.split('\n').filter(row => row.trim().length > 0);

    // Ensure there's at least one line for dimensions.
    if (allInputRows.length === 0) {
        console.error("No input received. Exiting.");
        process.exit(1); // Terminate with an error code.
    }

    // Parse the first line to get grid dimensions (width and height).
    const dimensionValues = extractNumbersFromString(allInputRows[0]);

    // Validate that exactly two dimensions were provided.
    if (dimensionValues.length !== 2) {
        console.error("Invalid dimension line format. Expected two numbers (Width Height). Exiting.");
        process.exit(1);
    }

    const gridHorizontalSize = dimensionValues[0];
    const gridVerticalSize = dimensionValues[1];

    // Further validate dimensions are positive integers.
    if (gridHorizontalSize <= 0 || gridVerticalSize <= 0 || !Number.isInteger(gridHorizontalSize) || !Number.isInteger(gridVerticalSize)) {
        console.error("Grid dimensions must be positive integers. Exiting.");
        process.exit(1);
    }

    // Extract and process the grid data from subsequent lines.
    // Each line is converted into an array of characters.
    const baseGridMatrix = allInputRows.slice(1).map(rowString => Array.from(rowString));

    // A crucial validation: check if the parsed grid height matches the declared height.
    if (baseGridMatrix.length !== gridVerticalSize) {
        console.error(`Grid height mismatch! Declared: ${gridVerticalSize}, Actual: ${baseGridMatrix.length}. Exiting.`);
        process.exit(1);
    }
    // Also validate each row's width.
    for (let currentY = 0; currentY < gridVerticalSize; ++currentY) {
        if (baseGridMatrix[currentY].length !== gridHorizontalSize) {
            console.error(`Row ${currentY} has a width mismatch! Declared: ${gridHorizontalSize}, Actual: ${baseGridMatrix[currentY].length}. Exiting.`);
            process.exit(1);
        }
    }

    /**
     * Defines the 8 relative coordinates for checking adjacent cells (Moore neighborhood).
     * The order can be arbitrary, as long as (0,0) is excluded.
     */
    const deltaCoordinates = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    // Iterate through each cell of the grid.
    for (let currentY = 0; currentY < gridVerticalSize; ++currentY) {
        for (let currentX = 0; currentX < gridHorizontalSize; ++currentX) {
            // Check if the current cell is an 'unexplored' spot ('.').
            if (baseGridMatrix[currentY][currentX] === UNEXPLORED_CELL_SYMBOL) {
                let nearbyHazardCount = 0; // Initialize counter for adjacent hazards.

                // Iterate through all 8 possible neighbor directions.
                for (const [deltaY, deltaX] of deltaCoordinates) {
                    const neighborY = currentY + deltaY;
                    const neighborX = currentX + deltaX;

                    // Check if the neighbor coordinates are within the grid boundaries.
                    const isWithinBounds =
                        neighborY >= 0 && neighborY < gridVerticalSize &&
                        neighborX >= 0 && neighborX < gridHorizontalSize;

                    if (isWithinBounds) {
                        // If the neighbor is a hazard cell ('#'), increment the count.
                        if (baseGridMatrix[neighborY][neighborX] === HAZARD_CELL_SYMBOL) {
                            nearbyHazardCount++;
                        }
                    }
                }
                // Update the current 'unexplored' cell with the count of adjacent hazards.
                // The number is converted to a string implicitly when assigned to a character array.
                baseGridMatrix[currentY][currentX] = nearbyHazardCount;
            }
        }
        // After processing each row, join its characters back into a string and print it.
        // This effectively prints the updated grid row by row.
        console.log(baseGridMatrix[currentY].join(''));
    }
});