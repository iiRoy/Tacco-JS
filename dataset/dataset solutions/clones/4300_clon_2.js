function ProcessInput(rawData) {
    // Divide the incoming raw data string into individual lines.
    let gridData = rawData.split('\n');

    // Extract the grid's dimensions (height and width) from the initial line.
    const gridHeight = +gridData[0].split(' ')[0]; // Convert string to number using unary plus.
    const gridWidth = +gridData[0].split(' ')[1]; // Convert string to number using unary plus.

    // Remove the first line (which contained dimensions) from the grid content.
    gridData = gridData.filter((elementItem, rowIdx) => rowIdx >= 1);

    // Search for all occurrences of '.' (representing empty cells) in the original raw input.
    const dotCount = rawData.match(/(\.)/g);

    // Check various scenarios based on the presence of empty cells.
    if (!dotCount) {
        // Scenario 1: No empty cells were found in the input.
        // This implies the grid is entirely filled with bombs or other non-empty characters.
        console.log(gridData.join('\n') + '\n');
    } else if (dotCount.length === gridWidth * gridHeight) {
        // Scenario 2: All cells in the grid are empty (no bombs).
        // Replace every character in the grid with '0' and output.
        console.log(gridData.join('\n').replace(/./g, '0') + '\n');
    } else {
        // Scenario 3: The grid contains a mix of empty cells and bombs.
        // This block attempts to process a grid named 'inputLines'.
        // IMPORTANT: The variable 'inputLines' is not defined anywhere in this scope.
        // As per Type II cloning rules, this exact behavioral bug (ReferenceError) is preserved.
        for (var rowIdx = 0; rowIdx < inputLines.length; rowIdx++) {
            for (var colIdx = 0; colIdx < inputLines[rowIdx].length; colIdx++) {
                // If the current cell is not an empty space ('.'), skip to the next cell.
                if (inputLines[rowIdx][colIdx] !== '.') continue;

                // Determine the values of adjacent cells, handling boundary conditions.
                // Cell directly above
                let cellUp = !inputLines[rowIdx - 1] ? null : inputLines[rowIdx - 1][colIdx];
                // Cell directly below
                let cellDown = !inputLines[rowIdx + 1] ? null : inputLines[rowIdx + 1][colIdx];
                // Cell to the right (Note: original condition `j==w` is always false for valid `j`,
                // so `inputLines[rowIdx][colIdx + 1]` is always accessed, potentially `undefined`.)
                let cellRight = (colIdx === gridWidth) ? null : inputLines[rowIdx][colIdx + 1];
                // Cell to the left
                let cellLeft = (colIdx === 0) ? null : inputLines[rowIdx][colIdx - 1];

                // Diagonal cells
                // Upper-right cell
                let cellUpRight = !(cellUp && cellRight) ? null : inputLines[rowIdx - 1][colIdx + 1];
                // Upper-left cell
                let cellUpLeft = !(cellUp && cellLeft) ? null : inputLines[rowIdx - 1][colIdx - 1];
                // Lower-right cell
                let cellDownRight = !(cellDown && cellRight) ? null : inputLines[rowIdx + 1][colIdx + 1];
                // Lower-left cell
                let cellDownLeft = !(cellDown && cellLeft) ? null : inputLines[rowIdx + 1][colIdx - 1];

                // Concatenate all adjacent cell values into a single string and count bomb characters ('#').
                let bombNeighborCount = (String(cellUp) + String(cellRight) + String(cellDown) + String(cellLeft) +
                                         String(cellUpRight) + String(cellUpLeft) + String(cellDownRight) + String(cellDownLeft))
                                        .match(/#/g);

                // If no bombs are found, the count is 0; otherwise, it's the number of matches.
                bombNeighborCount = !bombNeighborCount ? 0 : bombNeighborCount.length;

                // Replace the first occurrence of '.' in the current line with the calculated bomb count.
                inputLines[rowIdx] = inputLines[rowIdx].replace('.', bombNeighborCount);
            }
        }
        // Output the modified grid.
        console.log(inputLines.join('\n'));
    }
}
// Example usage (commented out, as in the original source):
// ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
