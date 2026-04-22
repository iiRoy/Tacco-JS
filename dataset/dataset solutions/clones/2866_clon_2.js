const ProcessGridData = (sourceText) => {
    // Splits the entire input string into an array of individual lines.
    let gridLines = sourceText.split('\n');

    // Parses the grid dimensions (height and width) from the first line.
    const dimensions = gridLines[0].split(' ');
    const rowCount = parseInt(dimensions[0], 10); // Number of rows in the grid.
    const colCount = parseInt(dimensions[1], 10); // Number of columns in the grid.

    // Removes the first line containing dimensions as it has been processed.
    gridLines.shift();

    // Transforms the remaining lines into a 2D array (matrix) of characters.
    // Each inner array represents a row, and each character is a cell's content.
    const cellMap = gridLines.map(line => line.split(''));

    // Truncates the cell map to ensure it only contains the actual 'rowCount' rows.
    // This handles cases where input might have extra blank lines at the end.
    cellMap.splice(rowCount, cellMap.length - rowCount);

    // Initializes two Dynamic Programming tables (2D arrays).
    // 'horizontalPathLengths' will store the length of continuous '.' paths to the right.
    // 'verticalPathLengths' will store the length of continuous '.' paths downwards.
    let horizontalPathLengths = new Array(rowCount);
    let verticalPathLengths = new Array(rowCount);

    // Populates both DP tables with initial arrays.
    // Each cell initially has a path length of 1, assuming it's a '.'
    // (obstacles will be set to 0 later).
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        horizontalPathLengths[rIdx] = new Array(colCount).fill(1);
        verticalPathLengths[rIdx] = new Array(colCount).fill(1);
    }

    // --- First Major Pass: Calculate rightward path lengths (left-to-right scan) ---
    // This loop iterates through each cell to determine how many consecutive '.' cells
    // are to its left, including itself, until an obstacle '#' or the grid edge.
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
            // If it's the first column in a row:
            if (cIdx === 0) {
                // If the cell is an obstacle, its path length is 0.
                if (cellMap[rIdx][cIdx] === '#') {
                    horizontalPathLengths[rIdx][cIdx] = 0;
                }
                // Otherwise (it's a '.'), its path length is 1 (already initialized).
            } else {
                // For subsequent columns:
                // If the current cell is a path cell ('.')
                if (cellMap[rIdx][cIdx] === '.') {
                    // Its path length is 1 plus the path length of the cell to its left.
                    horizontalPathLengths[rIdx][cIdx] = horizontalPathLengths[rIdx][cIdx - 1] + 1;
                } else {
                    // If it's an obstacle ('#'), the path breaks, so its length is 0.
                    horizontalPathLengths[rIdx][cIdx] = 0;
                }
            }
        }
    }

    // --- Second Major Pass: Propagate rightward path lengths (right-to-left scan) ---
    // This step ensures that all cells within a continuous horizontal path segment
    // correctly reflect the *total* length of that segment.
    // For example, if we have "....#.", the first pass might yield [1,2,3,4,0,1].
    // This pass will transform it to [4,4,4,4,0,1] or similar, ensuring each '.'
    // knows the full length of the path it's part of, looking right.
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        // Iterate from the second-to-last column backwards to the first.
        for (let cIdx = colCount - 2; cIdx >= 0; cIdx--) {
            // Only update path cells ('.').
            if (cellMap[rIdx][cIdx] === '.') {
                // If the cell to its immediate right has a non-zero path length
                // (meaning it's part of a continuous path segment).
                if (horizontalPathLengths[rIdx][cIdx + 1] !== 0) {
                    // The current cell's path length should be the same as the cell to its right,
                    // effectively propagating the full segment length leftwards.
                    horizontalPathLengths[rIdx][cIdx] = horizontalPathLengths[rIdx][cIdx + 1];
                }
            }
        }
    }

    // --- Third Major Pass: Calculate downward path lengths (top-to-bottom scan) ---
    // This is analogous to the first horizontal pass, but for vertical paths.
    // It determines how many consecutive '.' cells are above it, including itself.
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
            // If it's the first row:
            if (rIdx === 0) {
                // If the cell is an obstacle, its path length is 0.
                if (cellMap[rIdx][cIdx] === '#') {
                    verticalPathLengths[rIdx][cIdx] = 0;
                }
                // Otherwise ('.'), path length is 1 (initialized).
            } else {
                // For subsequent rows:
                // If the current cell is a path cell ('.')
                if (cellMap[rIdx][cIdx] === '.') {
                    // Its path length is 1 plus the path length of the cell directly above it.
                    verticalPathLengths[rIdx][cIdx] = verticalPathLengths[rIdx - 1][cIdx] + 1;
                } else {
                    // If it's an obstacle, its path length is 0.
                    verticalPathLengths[rIdx][cIdx] = 0;
                }
            }
        }
    }

    // --- Fourth Major Pass: Propagate downward path lengths (bottom-to-top scan) ---
    // Similar to the second horizontal pass, this ensures all cells in a continuous
    // vertical path segment reflect the *total* length of that segment, looking downwards.
    for (let rIdx = rowCount - 2; rIdx >= 0; rIdx--) {
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
            // Only update path cells ('.').
            if (cellMap[rIdx][cIdx] === '.') {
                // If the cell directly below has a non-zero path length.
                if (verticalPathLengths[rIdx + 1][cIdx] !== 0) {
                    // The current cell's path length should be the same as the cell below it.
                    verticalPathLengths[rIdx][cIdx] = verticalPathLengths[rIdx + 1][cIdx];
                }
            }
        }
    }

    // --- Final Calculation: Determine the maximum combined visibility score ---
    // The maximum visibility score is the largest sum of horizontal and vertical
    // path lengths for any single cell, adjusted by -1 because the cell itself
    // is counted in both horizontal and vertical segments.
    let maximumVisibilityScore = 0;

    // Iterate through every cell in the grid to find the maximum.
    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
            // Calculate the current cell's combined visibility and update the maximum.
            maximumVisibilityScore = Math.max(maximumVisibilityScore, horizontalPathLengths[rIdx][cIdx] + verticalPathLengths[rIdx][cIdx] - 1);
        }
    }

    // Outputs the computed maximum score to the standard console.
    console.log('%s', maximumVisibilityScore);
    // Returns the final calculated maximum visibility score.
    return maximumVisibilityScore;
};

// --- Auxiliary Function for Testing Purposes (typically used in a browser environment) ---
const testSolution = (caseNum) => {
    // Retrieves input from a specific HTML element based on the test case number.
    const testInput = document.getElementById("input" + caseNum).value;
    // Calls the main processing function with the retrieved input.
    const computedResult = ProcessGridData(testInput);

    // Retrieves the expected output for comparison.
    const expectedOutput = document.getElementById("output" + caseNum).value.split("\n")[0];
    // Initializes the test outcome status as "Wrong Answer".
    let testOutcomeStatus = "WA";

    // Compares the computed result (converted to string) with the expected output.
    if (computedResult.toString() === expectedOutput) {
        testOutcomeStatus = "AC"; // If they match, the status is "Accepted".
    }

    // Displays the test outcome status in a corresponding HTML element.
    document.getElementById("result" + caseNum).innerHTML = testOutcomeStatus;
};

// --- Entry Point for Execution in a Node.js Environment (e.g., competitive programming platforms) ---
// Reads the entire content of standard input (usually from a file) as a UTF-8 string.
// Then, it passes this string to the main grid processing function.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));