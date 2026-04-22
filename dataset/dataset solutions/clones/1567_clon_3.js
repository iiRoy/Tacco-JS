/**
 * Converts a string of space-separated numbers into an array of integers.
 * @param {string} inputStr The input string containing numbers.
 * @param {string} [separator=' '] The delimiter used to split the string.
 * @returns {Array<number>} An array of parsed integers.
 */
function parseNumbersFromString(inputStr, separator = ' ') {
    return inputStr.split(separator).map(s => parseInt(s, 10));
}

/**
 * Processes grid navigation to find minimum path lengths for reaching different rows.
 * This function simulates movement on a grid with horizontal barriers,
 * calculating the minimum number of steps to reach each subsequent row.
 *
 * @param {string} inputString Raw input string, expected to contain grid dimensions
 *                             on the first line, followed by barrier data for each row.
 */
function ProcessInput(inputString) {
    // Basic validation: ensure input is not empty
    if (!inputString || inputString.trim() === "") {
        console.error("Input string cannot be empty or just whitespace.");
        return;
    }

    // Split the entire input into individual lines for processing
    const allInputLines = inputString.split("\n");

    // Extract grid dimensions from the very first line
    const dimensionsLine = allInputLines[0];
    const barrierDefinitionLines = allInputLines.slice(1);

    // Parse height and width from the dimensions line
    const [gridHeight, gridWidth] = parseNumbersFromString(dimensionsLine);

    // Validate parsed grid dimensions
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        console.error("Invalid grid dimensions. Height and width must be positive integers.");
        return;
    }

    // Ensure the number of barrier definition lines matches the declared grid height
    if (barrierDefinitionLines.length !== gridHeight) {
        console.error(`Mismatch: Expected ${gridHeight} barrier lines, but found ${barrierDefinitionLines.length}.`);
        return;
    }

    // Construct the barrier data structure.
    // Each element `barrierLayout[i]` stores `[startCol, endCol]` for row `i` (0-indexed).
    const barrierLayout = [];
    for (let currentLineIdx = 0; currentLineIdx < gridHeight; currentLineIdx++) {
        const rowDataString = barrierDefinitionLines[currentLineIdx];
        const stringParts = rowDataString.split(' ');
        
        // Validate barrier data format for each row
        if (stringParts.length !== 2) {
            console.error(`Invalid barrier data format on row ${currentLineIdx + 1}: "${rowDataString}". Expected two numbers.`);
            return;
        }
        
        const startBarrier = parseInt(stringParts[0], 10);
        const endBarrier = parseInt(stringParts[1], 10);

        if (isNaN(startBarrier) || isNaN(endBarrier)) {
            console.error(`Invalid barrier column values on row ${currentLineIdx + 1}: "${rowDataString}". Expected integers.`);
            return;
        }
        
        barrierLayout.push([startBarrier, endBarrier]);
    }

    // Initialize an array to store the minimum number of moves to reach each row.
    // `minPathStepsToRow[i]` will store the minimum steps to reach what the original code considered `y = i + 2`.
    // We use `Infinity` as an initial value to easily find minimums using `Math.min`.
    const minPathStepsToRow = new Array(gridHeight).fill(Infinity);

    // Iterate through all possible starting columns (1-indexed, from 1 to gridWidth)
    for (let entryColumn = 1; entryColumn <= gridWidth; entryColumn++) {
        let currentColumnPosition = entryColumn; // Current column (1-indexed)
        let currentRowPosition = 1;            // Current row (1-indexed)
        let currentPathLength = 0;             // Number of moves taken for the current path

        // Simulate path traversal until the path goes beyond the grid boundaries.
        // The loop continues as long as the current position is within or just outside the grid limits
        // to allow for the final update for the last row.
        while (currentColumnPosition <= gridWidth && currentRowPosition <= gridHeight + 1) {
            let canAttemptDownwardMove = true;

            // Check for barriers only if we are still within the defined grid height.
            // If `currentRowPosition` is `gridHeight + 1`, there's no barrier data for it.
            if (currentRowPosition <= gridHeight) {
                // Adjust `currentRowPosition` to 0-indexed for accessing `barrierLayout`
                const currentBarrierRowIndex = currentRowPosition - 1;
                const [barrierStartColumn, barrierEndColumn] = barrierLayout[currentBarrierRowIndex];
                
                // If the current horizontal position is within the barrier range for this row,
                // a downward move is blocked.
                if (currentColumnPosition >= barrierStartColumn && currentColumnPosition <= barrierEndColumn) {
                    canAttemptDownwardMove = false;
                }
            }

            currentPathLength++; // Increment path length for the current step

            if (canAttemptDownwardMove) {
                currentRowPosition++; // Move one row down

                // Update the minimum path steps for the target row.
                // The original code updates `resultK[y-2]`.
                // With `currentRowPosition` now representing the *new* row we just entered,
                // `currentRowPosition - 2` gives the correct 0-indexed target for `minPathStepsToRow`.
                const targetResultIndex = currentRowPosition - 2;
                
                // Only update if the target index is valid for our result array
                if (targetResultIndex >= 0 && targetResultIndex < gridHeight) {
                    minPathStepsToRow[targetResultIndex] = Math.min(minPathStepsToRow[targetResultIndex], currentPathLength);
                }

                // If we've moved past the grid's bottom edge, this path segment is complete.
                if (currentRowPosition > gridHeight) {
                    break;
                }
            } else {
                currentColumnPosition++; // Move one column to the right

                // If we've moved past the grid's right edge, this path segment is complete.
                if (currentColumnPosition > gridWidth) {
                    break;
                }
            }
        }
    }

    // Convert `Infinity` values back to `-1` as per the problem's output requirement
    // (indicating that a row was not reachable by any path).
    const finalFormattedResults = minPathStepsToRow.map(moves => moves === Infinity ? -1 : moves);
    
    // Output the results, one per line
    console.log(finalFormattedResults.join("\n"));
}


// --- Standard Input/Output Handling (do not modify) ---
// This part reads the entire standard input and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Removed Utility Functions (as per Type III changes) ---
// The following utility functions were present in the original code but are not used
// in the cloned version's core logic or have been inlined/replaced for Type III changes.
// Therefore, they are removed to reduce clutter and demonstrate Type III deletions.
//
// function toBitIntArray(str, delimitor = ' ') { /* ... */ }
// function toMatrix(array, delimitor = ' ') { /* ... */ } // Inlined and modified
// function sum(n) { /* ... */ }