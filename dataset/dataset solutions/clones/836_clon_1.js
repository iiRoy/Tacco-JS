/*
 * This file contains a JavaScript program designed to simulate a
 * puzzle game or a similar grid-based logic.
 * It involves functions for "bombing" contiguous colored blocks
 * and then clearing them, followed by gravity simulation.
 */

// Function: bomb
// Purpose: Recursively identifies and marks connected blocks of the same color.
// Parameters:
//   y     - The current row index.
//   x     - The current column index.
//   color - The color of the block to match.
function bomb (y, x, color) {
    // Define relative offsets for checking adjacent cells (up, left, right, down).
    var dy = [ -1, 0, 0, 1 ]; // Delta y coordinates
    var dx = [ 0, -1, 1, 0 ]; // Delta x coordinates

    // Loop through the four possible directions.
    for (var i = 0; i < 4; i++) {
        var yy = y + dy[i]; // Calculate the new y coordinate.
        var xx = x + dx[i]; // Calculate the new x coordinate.

        // Check if the new coordinates are out of bounds.
        // If out of bounds, skip to the next iteration.
        if (yy < 0 || xx < 0 || yy >= 12 || xx >= 6) continue;

        // Check if the adjacent cell has the same color.
        if (yx[yy][xx] == color) {
            CNT++; // Increment the counter for connected blocks.

            // If four or more blocks are connected,
            // push the coordinates to the 'p' array for later processing.
            if (CNT == 4) p.push([yy, xx]);

            // Mark the current cell with its color and the current count.
            // This prevents re-processing the same cell in the current bomb chain.
            yx[yy][xx] = color + CNT;

            // Recursively call bomb for the adjacent cell.
            bomb(yy, xx, color);
        }
    }
}

// Function: BOMB
// Purpose: Clears connected blocks of a specific color,
//          and also clears 'O' type blocks if adjacent.
// Parameters:
//   y     - The current row index.
//   x     - The current column index.
//   color - The color of the block to clear.
function BOMB (y, x, color) {
    // Define relative offsets for checking adjacent cells.
    var dy = [ -1, 0, 0, 1 ];
    var dx = [ 0, -1, 1, 0 ];

    // Iterate over the four cardinal directions.
    for (var i = 0; i < 4; i++) {
        var yy = y + dy[i]; // New y coordinate.
        var xx = x + dx[i]; // New x coordinate.

        // Boundary check: if outside the grid, move to the next iteration.
        if (yy < 0 || xx < 0 || yy >= 12 || xx >= 6) continue;

        // If the adjacent block matches the specified color, clear it
        // and recursively call BOMB to clear its neighbors of the same color.
        if (yx[yy][xx] == color) {
            yx[yy][xx] = "."; // Mark as empty.
            BOMB(yy, xx, color);
        }
        // If the adjacent block is an 'O', clear it.
        // This is a special condition for clearing 'O' blocks.
        else if (yx[yy][xx] == "O") {
            yx[yy][xx] = "."; // Mark as empty.
        }
    }
}

// Function: up
// Purpose: Simulates gravity by moving blocks down into empty spaces.
// Parameters:
//   y - The current row index (where an empty space might be).
//   x - The current column index.
function up (y, x) {
    var yy = y; // Store the original y position.

    // Iterate upwards from the current position.
    while (y > 0) {
        y--; // Move to the row above.

        // If a non-empty block is found above, move it down to the original 'yy' position.
        if (yx[y][x] != ".") {
            yx[yy][x] = yx[y][x]; // Move the block down.
            yx[y][x] = ".";       // Clear the original position.
            break; // Stop after moving one block down.
        }
    }
}

// --- Main Program Execution ---

// Read input from standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into lines.
var Arr = (input.trim()).split("\n");

// Get the number of test cases from the first line of input.
var n = Arr.shift() - 0; // Convert to number.

// Loop through each test case.
for (var I = 0; I < n; I++) {
    var yx = []; // Initialize the game grid for the current test case.

    // Populate the grid from the input lines.
    for (var i = 0; i < 12; i++) {
        var arr = (Arr.shift()).split(""); // Get a row and split into characters.
        yx.push(arr);                      // Add the row to the grid.
    }

    var result = 0; // Initialize the score/result for the current test case.

    // Main game loop for each test case. Continues until no more blocks can be cleared.
    while (true) {
        var p = [];    // Array to store coordinates of blocks that triggered a "bomb" (4+ connected).
        var CNT;       // Counter for connected blocks.

        // First pass: Identify and mark connected blocks of the same color.
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 6; j++) {
                // Check each cell for a colored block.
                // If found, initialize CNT and call bomb to find connected components.
                if (yx[i][j] == "R") { CNT = 1; yx[i][j] = "R" + CNT; bomb(i, j, "R"); }
                if (yx[i][j] == "G") { CNT = 1; yx[i][j] = "G" + CNT; bomb(i, j, "G"); }
                if (yx[i][j] == "B") { CNT = 1; yx[i][j] = "B" + CNT; bomb(i, j, "B"); }
                if (yx[i][j] == "Y") { CNT = 1; yx[i][j] = "Y" + CNT; bomb(i, j, "Y"); }
                if (yx[i][j] == "P") { CNT = 1; yx[i][j] = "P" + CNT; bomb(i, j, "P"); }
            }
        }

        // Second pass: Reset the temporary marks (e.g., "R1", "G2") back to just the color ("R", "G").
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 6; j++) {
                yx[i][j] = yx[i][j].slice(0, 1); // Take only the first character.
            }
        }

        // If no "bomb" conditions (4+ connected blocks) were met in this round, break the game loop.
        if (p.length == 0) break;

        result++; // Increment the result (score or number of cleared rounds).

        // Third pass: Clear the blocks identified by the 'p' array (the "bombs").
        p.forEach(function (v) {
            var i = v[0];     // Row index from the 'p' array.
            var j = v[1];     // Column index from the 'p' array.
            var color = yx[i][j]; // Get the color of the block.

            // If the block is not already empty, call BOMB to clear it and its neighbors.
            if (color != ".") BOMB(i, j, color);
        });

        // Fourth pass: Apply gravity.
        // Iterate from bottom-up, and for each empty cell,
        // call 'up' to pull down blocks from above.
        for (var i = 11; i > 0; i--) { // Start from the second-to-last row and go up.
            for (var j = 0; j < 6; j++) {
                if (yx[i][j] == ".") up(i, j); // If cell is empty, apply gravity.
            }
        }
    }

    // Print the final result for the current test case.
    console.log(result);
}