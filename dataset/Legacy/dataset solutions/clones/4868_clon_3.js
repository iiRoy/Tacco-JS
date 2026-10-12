const HASH_CHAR = "#";
const DOT_CHAR = ".";
const POSSIBLE_MSG = "Possible";
const IMPOSSIBLE_MSG = "Impossible";

var rawInputData;
var gridHeight;
var gridWidth;

function processGridData(inputString) {
    rawInputData = inputString.split("\n");

    const dimensionParts = rawInputData[0].split(" ");
    gridHeight = parseInt(dimensionParts[0], 10);
    gridWidth = parseInt(dimensionParts[1], 10);

    // previousRowProcessed holds the processed string of the row directly above the one currently being built.
    // It is initialized with the first actual grid row (rawInputData[1]) as per original logic.
    let previousRowProcessed = rawInputData[1];
    let currentProcessedRowBuffer = ""; // This buffer accumulates characters for the current row being processed.

    // The outer loop iterates through grid rows, starting from the second actual grid row (index 2 in rawInputData).
    // The original loop condition `i <= height` means it processes up to `rawInputData[gridHeight]`.
    for (let rowIndex = 2; rowIndex <= gridHeight; rowIndex++) {
        let currentHashCount = 0; // Counts '#' characters in the currentProcessedRowBuffer.
        currentProcessedRowBuffer = ""; // Reset the buffer for the new row.

        const currentRowRaw = rawInputData[rowIndex]; // Get the raw input string for the current row.

        // The inner loop iterates through columns of the current row.
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const currentCellChar = currentRowRaw[colIndex]; // Character at the current grid position.

            if (currentCellChar === HASH_CHAR) {
                const isLastCellInGrid = (rowIndex === gridHeight && colIndex === gridWidth - 1);
                if (isLastCellInGrid) {
                    console.log(POSSIBLE_MSG);
                    return; // Exit early if the last cell is a hash.
                }

                // Check for existence of right and down neighbors within grid boundaries.
                const hasRightNeighbor = (colIndex + 1 < gridWidth);
                const hasDownNeighbor = (rowIndex + 1 <= gridHeight);

                let rightNeighborChar = DOT_CHAR;
                if (hasRightNeighbor) {
                    rightNeighborChar = currentRowRaw[colIndex + 1];
                }

                let downNeighborChar = DOT_CHAR;
                if (hasDownNeighbor) {
                    downNeighborChar = rawInputData[rowIndex + 1][colIndex];
                }

                // Check for the "Impossible" pattern: current cell is '#', and both right and down neighbors are '#'.
                const formsImpossiblePattern = (hasRightNeighbor && hasDownNeighbor && rightNeighborChar === HASH_CHAR && downNeighborChar === HASH_CHAR);

                if (formsImpossiblePattern) {
                    console.log(IMPOSSIBLE_MSG);
                    return; // Exit early if the impossible pattern is found.
                }

                // Determine if the cell directly above or to the left is a hash.
                const aboveCellIsHash = (previousRowProcessed[colIndex] === HASH_CHAR);
                const leftCellIsHash = (colIndex > 0 && currentRowRaw[colIndex - 1] === HASH_CHAR);

                let charToAppend = HASH_CHAR; // Default character to append to the processed row.

                // Apply the complex logic from the original code to decide if a '#' becomes a '.'.
                // Original: `if(oldList[j]!="#") { if(j == 0 || j > 0 && input[i][j-1]!="#") { newList = newList + "."; continue; } }`
                if (!aboveCellIsHash) { // If the cell directly above is NOT a hash.
                    const isFirstColumn = (colIndex === 0);
                    const isLeftCellNotHash = (colIndex > 0 && !leftCellIsHash);

                    if (isFirstColumn || isLeftCellNotHash) {
                        charToAppend = DOT_CHAR; // Change to '.' if conditions met.
                    }
                }

                currentProcessedRowBuffer += charToAppend;
                if (charToAppend === HASH_CHAR) {
                    currentHashCount++;
                }

            } else { // If currentCellChar is DOT_CHAR ('.')
                currentProcessedRowBuffer += DOT_CHAR;
            }
        }

        // After processing all columns for the current row:
        if (currentHashCount === 0) {
            break; // If no hashes were found in the current processed row, stop further processing.
        }
        // Update previousRowProcessed for the *next* iteration of the outer loop.
        previousRowProcessed = currentProcessedRowBuffer;
    }

    // If the loops complete without an early "Possible" return, it means no path was found.
    console.log(IMPOSSIBLE_MSG);
}

// Standard input/output handling, as per original structure.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
