function ProcessBingoGame(gameInputData) {
    // Separate the entire input string into individual lines for processing.
    const parsedLines = gameInputData.split('\n');

    // --- Input Validation and Parsing (Type III: Added checks, changed parsing methods) ---
    const MIN_REQUIRED_LINES = 4; // 3 for grid + 1 for drawn numbers count
    if (parsedLines.length < MIN_REQUIRED_LINES) {
        console.error("Error: Insufficient input lines provided for a bingo game.");
        return; // Exit early if input is invalid
    }

    // Parse the 3x3 bingo card values. Each cell is converted to a number.
    const bingoCardValues = [];
    for (let r = 0; r < 3; r++) {
        if (r >= parsedLines.length) {
            console.error(`Error: Missing bingo card row ${r + 1}.`);
            return;
        }
        // Use map to convert string segments to numbers directly.
        bingoCardValues.push(parsedLines[r].split(' ').map(val => parseInt(val.trim(), 10)));
    }

    // Determine the total count of numbers that have been drawn.
    const numberOfDrawnItems = parseInt(parsedLines[3], 10);
    if (isNaN(numberOfDrawnItems) || numberOfDrawnItems < 0) {
        console.error("Error: Invalid or missing count for drawn numbers.");
        return;
    }

    // Store the drawn numbers in a Set for efficient lookup (Type III: Data structure change).
    const selectedNumbers = new Set();
    // Start reading drawn numbers from the 5th line (index 4).
    for (let dIdx = 0; dIdx < numberOfDrawnItems; dIdx++) {
        const currentLineIndex = 4 + dIdx;
        if (currentLineIndex >= parsedLines.length) {
            console.warn(`Warning: Expected ${numberOfDrawnItems} drawn items, but input ended prematurely after ${dIdx} items.`);
            break; // Stop if we run out of lines
        }
        // Convert each drawn number to an integer before adding to the Set.
        selectedNumbers.add(parseInt(parsedLines[currentLineIndex].trim(), 10));
    }

    // --- Marking the Bingo Card (Type III: Changed boolean grid, Set lookup) ---
    // Initialize a 3x3 grid to track which cells on the bingo card have been marked.
    // Using `false` for unmarked and `true` for marked.
    const cardMarkedStatus = Array.from({ length: 3 }, () => Array(3).fill(false));

    // Iterate through each cell of the bingo card.
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            // Check if the value in the current cell is present in the set of selected numbers.
            if (selectedNumbers.has(bingoCardValues[r][c])) {
                cardMarkedStatus[r][c] = true; // Mark the cell if it's a match.
            }
        }
    }

    // --- Bingo Win Condition Check (Type III: Refactored into a helper function, fixed diagonal logic) ---
    /**
     * Determines if a bingo win condition is met on the provided 3x3 status grid.
     * @param {boolean[][]} currentStatusGrid A 3x3 array indicating marked cells.
     * @returns {boolean} True if bingo is found, false otherwise.
     */
    const evaluateWinState = (currentStatusGrid) => {
        const GRID_DIMENSION = 3;

        // Check all rows and all columns for a complete line.
        for (let idx = 0; idx < GRID_DIMENSION; idx++) {
            let isRowFullyMarked = true;
            let isColumnFullyMarked = true;
            for (let jdx = 0; jdx < GRID_DIMENSION; jdx++) {
                // Check if any cell in the current row (idx) is unmarked.
                if (!currentStatusGrid[idx][jdx]) {
                    isRowFullyMarked = false;
                }
                // Check if any cell in the current column (idx) is unmarked.
                if (!currentStatusGrid[jdx][idx]) {
                    isColumnFullyMarked = false;
                }
            }
            // If either a full row or a full column is found, a bingo exists.
            if (isRowFullyMarked || isColumnFullyMarked) {
                return true;
            }
        }

        // Check the main diagonal (top-left to bottom-right).
        let isMainDiagonalMarked = true;
        for (let kdx = 0; kdx < GRID_DIMENSION; kdx++) {
            if (!currentStatusGrid[kdx][kdx]) {
                isMainDiagonalMarked = false;
                break; // No need to check further if one cell is unmarked.
            }
        }
        if (isMainDiagonalMarked) {
            return true;
        }

        // Check the anti-diagonal (top-right to bottom-left).
        let isAntiDiagonalMarked = true;
        for (let kdx = 0; kdx < GRID_DIMENSION; kdx++) {
            if (!currentStatusGrid[kdx][GRID_DIMENSION - 1 - kdx]) {
                isAntiDiagonalMarked = false;
                break; // No need to check further if one cell is unmarked.
            }
        }
        if (isAntiDiagonalMarked) {
            return true;
        }

        // If no bingo condition was met after all checks.
        return false;
    };

    // --- Output Result ---
    const hasPlayerAchievedBingo = evaluateWinState(cardMarkedStatus);

    if (hasPlayerAchievedBingo) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Standard competitive programming input handling.
ProcessBingoGame(require("fs").readFileSync("/dev/stdin", "utf8"));