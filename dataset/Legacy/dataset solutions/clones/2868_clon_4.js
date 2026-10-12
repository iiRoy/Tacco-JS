"use strict";

function solveMazeLighting(rawMazeInput) {
    const processedLines = rawMazeInput.split('\n');
    processedLines.shift(); // Discard the first line containing dimensions, as it's not used in the original logic.

    const mazeGrid = processedLines.map(lineSegment => lineSegment.split(''));

    const totalRows = mazeGrid.length;
    if (totalRows === 0) {
        console.log(0);
        return;
    }
    const totalCols = mazeGrid[0].length;
    if (totalCols === 0) {
        console.log(0);
        return;
    }

    // Initialize dynamic programming arrays to store visibility counts for each direction.
    // Each cell (r, c) will store the number of consecutive '.' cells in that direction,
    // including itself, until a '#' or boundary is met.
    const upwardVisibility = Array.from({ length: totalRows }, () => Array(totalCols).fill(0));
    const downwardVisibility = Array.from({ length: totalRows }, () => Array(totalCols).fill(0));
    const leftwardVisibility = Array.from({ length: totalRows }, () => Array(totalCols).fill(0));
    const rightwardVisibility = Array.from({ length: totalRows }, () => Array(totalCols).fill(0));

    // First pass: Compute upward and leftward visibility (from top-left to bottom-right)
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            if (mazeGrid[r][c] === '.') {
                upwardVisibility[r][c] = (r > 0 ? upwardVisibility[r - 1][c] : 0) + 1;
                leftwardVisibility[r][c] = (c > 0 ? leftwardVisibility[r][c - 1] : 0) + 1;
            }
        }
    }

    // Second pass: Compute downward and rightward visibility (from bottom-right to top-left)
    for (let r = totalRows - 1; r >= 0; r--) {
        for (let c = totalCols - 1; c >= 0; c--) {
            if (mazeGrid[r][c] === '.') {
                downwardVisibility[r][c] = (r < totalRows - 1 ? downwardVisibility[r + 1][c] : 0) + 1;
                rightwardVisibility[r][c] = (c < totalCols - 1 ? rightwardVisibility[r][c + 1] : 0) + 1;
            }
        }
    }

    let maximumIlluminatedCells = 0;

    // Final pass: Calculate the total illuminated cells for each possible lamp position
    // and find the maximum.
    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            if (mazeGrid[r][c] === '.') {
                // The total illuminated cells for a lamp at (r, c) is the sum of visible cells
                // in all four cardinal directions. Each visibility count (upwardVisibility, etc.)
                // includes the current cell (r, c). So, we subtract 1 from each direction's count
                // to get only the *additional* cells lit in that direction, and then add 1 back
                // for the current cell itself.
                const currentIllumination =
                    (upwardVisibility[r][c] - 1) +
                    (downwardVisibility[r][c] - 1) +
                    (leftwardVisibility[r][c] - 1) +
                    (rightwardVisibility[r][c] - 1) + 1;
                
                maximumIlluminatedCells = Math.max(maximumIlluminatedCells, currentIllumination);
            }
        }
    }

    console.log(maximumIlluminatedCells);
}

solveMazeLighting(require("fs").readFileSync("/dev/stdin", "utf8"));
