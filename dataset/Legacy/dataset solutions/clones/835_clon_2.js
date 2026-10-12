function detonate(rowIdx, colIdx, blobColor) {
    // Define relative offsets for checking adjacent cells (up, left, right, down)
    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];

    // Iterate through the four possible directions
    for (let k = 0; k < 4; k++) {
        const nextRow = rowIdx + rowOffsets[k];
        const nextCol = colIdx + colOffsets[k];

        // Check if the adjacent cell is within the grid boundaries
        if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
            continue; // Skip if out of bounds
        }

        // If the adjacent cell has the same color blob
        if (gameGrid[nextRow][nextCol] === blobColor) {
            chainCount++; // Increment the count of connected blobs
            // If 4 or more blobs are connected, add the current cell to the list of explosion points
            if (chainCount === 4) {
                explosionPoints.push([nextRow, nextCol]);
            }
            // Mark the current blob with its color and the current chain count
            // This prevents re-processing the same blob in the current chain and helps identify chain size
            gameGrid[nextRow][nextCol] = blobColor + chainCount;
            // Recursively call detonate for the newly found connected blob
            detonate(nextRow, nextCol, blobColor);
        }
    }
}

function clearBlobs(rowIdx, colIdx, blobColor) {
    // Define relative offsets for checking adjacent cells (up, left, right, down)
    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];

    // Iterate through the four possible directions
    for (let k = 0; k < 4; k++) {
        const nextRow = rowIdx + rowOffsets[k];
        const nextCol = colIdx + colOffsets[k];

        // Check if the adjacent cell is within the grid boundaries
        if (nextRow < 0 || nextCol < 0 || nextRow >= 12 || nextCol >= 6) {
            continue; // Skip if out of bounds
        }

        // If the adjacent cell has the same color blob, clear it and recurse
        if (gameGrid[nextRow][nextCol] === blobColor) {
            gameGrid[nextRow][nextCol] = "."; // Mark as empty
            clearBlobs(nextRow, nextCol, blobColor); // Recurse to clear connected blobs
        } else if (gameGrid[nextRow][nextCol] === "O") {
            // If it's an 'O' type blob, clear it as well
            gameGrid[nextRow][nextCol] = "."; // Mark as empty
        }
    }
}

function shiftDown(rowIdx, colIdx) {
    let currentRow = rowIdx;
    // Iterate upwards from the current position
    while (currentRow > 0) {
        currentRow--; // Move to the cell above
        // If a non-empty blob is found above
        if (gameGrid[currentRow][colIdx] !== ".") {
            // Move the blob down to the original empty position
            gameGrid[rowIdx][colIdx] = gameGrid[currentRow][colIdx];
            gameGrid[currentRow][colIdx] = "."; // Clear the original position
            break; // Stop after moving one blob
        }
    }
}

// Read input from stdin
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into lines and remove any leading/trailing whitespace
const inputLines = rawData.trim().split("\n");

// Get the number of test cases
const numCases = parseInt(inputLines.shift(), 10);

// Process each test case
for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
    // Initialize the game grid for the current test case
    let gameGrid = [];
    for (let k = 0; k < 12; k++) {
        // Read each row, split into characters, and add to the grid
        const gridRowChars = inputLines.shift().split("");
        gameGrid.push(gridRowChars);
    }

    let totalExplosions = 0; // Counter for the number of explosion rounds

    // Main game loop: continue as long as explosions occur
    while (true) {
        let explosionPoints = []; // Stores coordinates of blobs that trigger an explosion (chain of 4+)
        let chainCount; // Global counter for the current chain of connected blobs

        // First pass: Identify potential explosions by finding chains of 4 or more
        for (let k = 0; k < 12; k++) {
            for (let m = 0; m < 6; m++) {
                // Check each cell for a colored blob and initiate a chain search
                if (gameGrid[k][m] === "R") { chainCount = 1; gameGrid[k][m] = "R" + chainCount; detonate(k, m, "R"); }
                if (gameGrid[k][m] === "G") { chainCount = 1; gameGrid[k][m] = "G" + chainCount; detonate(k, m, "G"); }
                if (gameGrid[k][m] === "B") { chainCount = 1; gameGrid[k][m] = "B" + chainCount; detonate(k, m, "B"); }
                if (gameGrid[k][m] === "Y") { chainCount = 1; gameGrid[k][m] = "Y" + chainCount; detonate(k, m, "Y"); }
                if (gameGrid[k][m] === "P") { chainCount = 1; gameGrid[k][m] = "P" + chainCount; detonate(k, m, "P"); }
            }
        }

        // Second pass: Reset marked blobs to their original color (remove chain count suffix)
        for (let k = 0; k < 12; k++) {
            for (let m = 0; m < 6; m++) {
                gameGrid[k][m] = gameGrid[k][m].slice(0, 1);
            }
        }

        // If no explosion points were found in this round, break the loop
        if (explosionPoints.length === 0) {
            break;
        }

        totalExplosions++; // Increment the total explosion rounds

        // Third pass: Clear all blobs involved in an explosion
        explosionPoints.forEach(function(pointCoords) {
            const row = pointCoords[0];
            const col = pointCoords[1];
            const blobColor = gameGrid[row][col];
            // Only clear if the blob hasn't already been cleared by a previous explosion in this round
            if (blobColor !== ".") {
                clearBlobs(row, col, blobColor);
            }
        });

        // Fourth pass: Apply gravity - shift blobs down to fill empty spaces
        // Iterate from bottom-up to ensure correct gravity application
        for (let k = 11; k > 0; k--) {
            for (let m = 0; m < 6; m++) {
                // If a cell is empty, try to shift a blob down into it
                if (gameGrid[k][m] === ".") {
                    shiftDown(k, m);
                }
            }
        }
    }
    // Output the total number of explosion rounds for the current test case
    console.log(totalExplosions);
}
