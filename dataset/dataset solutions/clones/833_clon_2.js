function scanNeighbors(rowCoord, colCoord, blockType) {
    // Define relative offsets for adjacent cells (up, left, right, down)
    var rowOffsets = [-1, 0, 0, 1];
    var colOffsets = [0, -1, 1, 0];

    // Iterate through all four possible adjacent directions
    for (var idx = 0; idx < 4; idx++) {
        var nextRow = rowCoord + rowOffsets[idx];
        var nextCol = colCoord + colOffsets[idx];

        // Check if the adjacent cell is within the grid boundaries
        if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
            continue; // Skip if out of bounds
        }

        // If the adjacent cell has the same block type
        if (gameGrid[nextRow][nextCol] === blockType) {
            currentCount++; // Increment the count of connected blocks
            // If 4 or more connected blocks are found, add the current cell to potential removals
            if (currentCount === 4) {
                removalCandidates.push([nextRow, nextCol]);
            }
            // Mark the current cell with its type and count to avoid re-processing in this chain
            gameGrid[nextRow][nextCol] = blockType + currentCount;
            // Recursively call to find more connected blocks
            scanNeighbors(nextRow, nextCol, blockType);
        }
    }
}

function clearConnected(rowCoord, colCoord, blockType) {
    // Define relative offsets for adjacent cells (up, left, right, down)
    var rowOffsets = [-1, 0, 0, 1];
    var colOffsets = [0, -1, 1, 0];

    // Iterate through all four possible adjacent directions
    for (var idx = 0; idx < 4; idx++) {
        var nextRow = rowCoord + rowOffsets[idx];
        var nextCol = colCoord + colOffsets[idx];

        // Check if the adjacent cell is within the grid boundaries
        if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
            continue; // Skip if out of bounds
        }

        // If the adjacent cell has the same block type, clear it and recurse
        if (gameGrid[nextRow][nextCol] === blockType) {
            gameGrid[nextRow][nextCol] = "."; // Mark as empty
            clearConnected(nextRow, nextCol, blockType);
        } else if (gameGrid[nextRow][nextCol] === "O") {
            // If it's an 'O' block (obstacle/special block), clear it too
            gameGrid[nextRow][nextCol] = "."; // Mark as empty
        }
    }
}

function shiftColumnUp(currentRow, targetCol) {
    // Store the initial empty row position
    var emptyRow = currentRow;
    // Move upwards from the current empty row
    while (currentRow > 0) {
        currentRow--; // Check the row above
        // If a non-empty block is found
        if (gameGrid[currentRow][targetCol] !== ".") {
            // Move the block down to the empty spot
            gameGrid[emptyRow][targetCol] = gameGrid[currentRow][targetCol];
            gameGrid[currentRow][targetCol] = "."; // Clear the original spot
            break; // Only shift one block up to fill the gap
        }
    }
}

// Global-like variables for the recursive functions, scoped per test case
var gameGrid; // Corresponds to 'yx'
var removalCandidates; // Corresponds to 'p'
var currentCount; // Corresponds to 'CNT'

// Read input from standard input
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace and split into lines
var inputLines = (rawData.trim()).split("\n");

// Get the number of test cases from the first line
var numTestCases = inputLines.shift() - 0; // Convert to number

// Loop through each test case
for (var testCaseIdx = 0; testCaseIdx < numTestCases; testCaseIdx++) {
    // Initialize game grid for each test case
    gameGrid = []; // 'yx' in original
    for (var gridRowIdx = 0; gridRowIdx < 12; gridRowIdx++) {
        // Read each row, split into characters, and add to the grid
        var gridRow = (inputLines.shift()).split("");
        gameGrid.push(gridRow);
    }

    // Initialize the counter for chain reactions
    var chainReactionCount = 0; // 'result' in original

    // Main game loop: continues as long as blocks are being cleared
    while (true) {
        // Initialize removal candidates and current count for each iteration of the game loop
        removalCandidates = []; // 'p' in original
        currentCount; // 'CNT' in original, will be assigned 1 before each scanNeighbors call

        // First pass: Identify connected blocks of 4 or more
        for (var scanRowIdx = 0; scanRowIdx < 12; scanRowIdx++) {
            for (var scanColIdx = 0; scanColIdx < 6; scanColIdx++) {
                // Check each block type and initiate a recursive scan if found
                if (gameGrid[scanRowIdx][scanColIdx] === "R") {
                    currentCount = 1;
                    gameGrid[scanRowIdx][scanColIdx] = "R" + currentCount; // Mark as visited
                    scanNeighbors(scanRowIdx, scanColIdx, "R");
                }
                if (gameGrid[scanRowIdx][scanColIdx] === "G") {
                    currentCount = 1;
                    gameGrid[scanRowIdx][scanColIdx] = "G" + currentCount;
                    scanNeighbors(scanRowIdx, scanColIdx, "G");
                }
                if (gameGrid[scanRowIdx][scanColIdx] === "B") {
                    currentCount = 1;
                    gameGrid[scanRowIdx][scanColIdx] = "B" + currentCount;
                    scanNeighbors(scanRowIdx, scanColIdx, "B");
                }
                if (gameGrid[scanRowIdx][scanColIdx] === "Y") {
                    currentCount = 1;
                    gameGrid[scanRowIdx][scanColIdx] = "Y" + currentCount;
                    scanNeighbors(scanRowIdx, scanColIdx, "Y");
                }
                if (gameGrid[scanRowIdx][scanColIdx] === "P") {
                    currentCount = 1;
                    gameGrid[scanRowIdx][scanColIdx] = "P" + currentCount;
                    scanNeighbors(scanRowIdx, scanColIdx, "P");
                }
            }
        }

        // Reset marked blocks to their original single-character type
        for (var sliceRowIdx = 0; sliceRowIdx < 12; sliceRowIdx++) {
            for (var sliceColIdx = 0; sliceColIdx < 6; sliceColIdx++) {
                gameGrid[sliceRowIdx][sliceColIdx] = gameGrid[sliceRowIdx][sliceColIdx].slice(0, 1);
            }
        }

        // If no blocks were marked for removal in this iteration, break the loop
        if (removalCandidates.length === 0) {
            break;
        }

        // Increment the chain reaction counter
        chainReactionCount++;

        // Second pass: Clear the identified connected blocks
        removalCandidates.forEach(function (candidatePos) {
            var targetRow = candidatePos[0];
            var targetCol = candidatePos[1];
            var blockToClear = gameGrid[targetRow][targetCol]; // Get the actual block type
            clearConnected(targetRow, targetCol, blockToClear); // Recursively clear connected blocks
        });

        // Third pass: Apply gravity - shift blocks down to fill empty spaces
        // Iterate from bottom-up, column by column
        for (var gravityRowIdx = 11; gravityRowIdx > 0; gravityRowIdx--) {
            for (var gravityColIdx = 0; gravityColIdx < 6; gravityColIdx++) {
                if (gameGrid[gravityRowIdx][gravityColIdx] === ".") {
                    shiftColumnUp(gravityRowIdx, gravityColIdx); // Shift blocks in this column
                }
            }
        }
    }
    // Output the total chain reaction count for the current test case
    console.log(chainReactionCount);
}
