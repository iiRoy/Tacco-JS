function ProcessGridData(rawDataInput) {
    // Validate initial input: ensure it's a string and not empty.
    if (typeof rawDataInput !== 'string' || rawDataInput.trim() === '') {
        console.error("Input data is invalid or empty. Cannot process grid.");
        return 0; // Return zero connections for invalid input
    }

    // Split the entire input block into an array of individual lines.
    const inputLines = rawDataInput.split("\n");

    // Define symbols for obstacles and open paths for better readability and maintainability.
    const OBSTACLE_SYMBOL = '#';
    const PATH_SYMBOL = '.';

    // Attempt to parse grid dimensions from the very first line of input.
    const dimensionTokens = inputLines[0].split(" ");
    const gridRows = parseInt(dimensionTokens[0], 10);
    const gridCols = parseInt(dimensionTokens[1], 10);

    // Perform robust validation on the parsed dimensions.
    if (isNaN(gridRows) || isNaN(gridCols) || gridRows <= 0 || gridCols <= 0) {
        console.error(`Invalid grid dimensions: Rows=${dimensionTokens[0]}, Cols=${dimensionTokens[1]}. Must be positive integers.`);
        return 0;
    }

    // Initialize the 2D array (matrix) that will represent our grid.
    const characterGrid = new Array(gridRows);

    // Populate the grid matrix using the subsequent lines of input.
    // Start from index 1 of inputLines because index 0 contains dimensions.
    for (let currentRowIdx = 0; currentRowIdx < gridRows; currentRowIdx++) {
        const sourceLineIndex = currentRowIdx + 1; // Corresponding line in inputLines

        // Guard clause: ensure we don't go out of bounds on inputLines.
        if (sourceLineIndex >= inputLines.length) {
            console.warn(`Input data truncated. Expected ${gridRows} rows, but only found ${currentRowIdx} data rows. Processing partial grid.`);
            break; // Exit loop if input lines are exhausted prematurely
        }

        const lineCharacters = inputLines[sourceLineIndex].split("");

        // Validate individual row length. If it doesn't match, log a warning and adjust.
        if (lineCharacters.length < gridCols) {
            console.warn(`Row ${currentRowIdx} is shorter than expected (${lineCharacters.length} vs ${gridCols}). Padding with spaces.`);
            characterGrid[currentRowIdx] = lineCharacters.concat(new Array(gridCols - lineCharacters.length).fill(' '));
        } else if (lineCharacters.length > gridCols) {
            console.warn(`Row ${currentRowIdx} is longer than expected (${lineCharacters.length} vs ${gridCols}). Truncating extra characters.`);
            characterGrid[currentRowIdx] = lineCharacters.slice(0, gridCols);
        } else {
            characterGrid[currentRowIdx] = lineCharacters;
        }
    }

    // This array will store all detected pairs of adjacent obstacle-path cells.
    const adjacencyRecords = [];

    // Define relative coordinate offsets for 4-directional neighbors (up, down, left, right).
    const directionVectors = [
        { dRow: -1, dCol: 0 }, // North
        { dRow: 1, dCol: 0 },  // South
        { dRow: 0, dCol: -1 }, // West
        { dRow: 0, dCol: 1 }   // East
    ];

    // Iterate over each cell in the grid to find obstacle-path adjacencies.
    for (let primaryRow = 0; primaryRow < gridRows; primaryRow++) {
        for (let primaryCol = 0; primaryCol < gridCols; primaryCol++) {
            const currentCellType = characterGrid[primaryRow][primaryCol];

            // Optimization: Only check neighbors if the current cell is an obstacle.
            if (currentCellType === OBSTACLE_SYMBOL) {
                // Examine all four cardinal neighbors.
                for (const vector of directionVectors) {
                    const neighborRow = primaryRow + vector.dRow;
                    const neighborCol = primaryCol + vector.dCol;

                    // Check if the potential neighbor is within the grid boundaries.
                    const isNeighborInBounds = (
                        neighborRow >= 0 && neighborRow < gridRows &&
                        neighborCol >= 0 && neighborCol < gridCols
                    );

                    if (isNeighborInBounds) {
                        const neighborCellType = characterGrid[neighborRow][neighborCol];

                        // If the neighbor is an open path, record this connection.
                        if (neighborCellType === PATH_SYMBOL) {
                            adjacencyRecords.push({
                                origin: { row: primaryRow, col: primaryCol },
                                destination: { row: neighborRow, col: neighborCol }
                            });
                        }
                    }
                }
            }
        }
    }

    // Output the final count of detected obstacle-path connections to the console.
    console.log(adjacencyRecords.length);

    // Return the count, allowing the function to be used in other contexts.
    return adjacencyRecords.length;
}

// Standard boilerplate for reading input in competitive programming environments.
// This executes the main processing function with data from standard input.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));