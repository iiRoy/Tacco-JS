const executeBingoGame = (inputLines) => {
    // Helper function to parse a single line of space-separated numeric strings into an array of numbers.
    const parseNumericStringLine = (lineContent) => lineContent.split(" ").map(Number);

    // Initialize the bingo board from the first three input lines.
    // Each line represents a row of the 3x3 bingo card.
    const boardRowA = parseNumericStringLine(inputLines[0]);
    const boardRowB = parseNumericStringLine(inputLines[1]);
    const boardRowC = parseNumericStringLine(inputLines[2]);

    // Consolidate the 3x3 board into a single 1D array for simpler indexing and marking.
    // This represents the 9 cells of the game board.
    let flatGameGrid = [...boardRowA, ...boardRowB, ...boardRowC];

    // A set to keep track of all numbers that have been announced.
    // This can be useful for debugging or alternative marking strategies, but primarily
    // serves as an intermediate data structure addition.
    const announcedNumbersRegistry = new Set();

    // Variable to store the ultimate result of the game.
    let finalGameResult = 'No'; // Default outcome: no bingo achieved.

    // Define all possible winning lines on a 3x3 bingo board using 1D array indices.
    // This makes the bingo check logic more modular and readable.
    const potentialWinningPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal lines
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical lines
        [0, 4, 8], [2, 4, 6]             // Diagonal lines
    ];

    // Helper function to check if any bingo pattern is matched on the current game grid.
    const verifyBingoStatus = (currentGrid) => {
        // Iterate through each predefined winning pattern.
        for (const patternIndices of potentialWinningPatterns) {
            // Check if every cell in the current pattern is marked 'O'.
            const isPatternCompleted = patternIndices.every(cellIndex => currentGrid[cellIndex] === 'O');
            if (isPatternCompleted) {
                return true; // Bingo found!
            }
        }
        return false; // No bingo pattern is currently complete.
    };

    // Process the remaining input lines, which are the numbers called out during the game.
    // Start from the fourth line (index 3).
    for (let callIndex = 3; callIndex < inputLines.length; callIndex++) {
        const currentNumberCalled = Number(inputLines[callIndex]); // Convert the string input to a number.
        
        // Record the current number in our registry.
        announcedNumbersRegistry.add(currentNumberCalled);

        // Iterate through the flat game grid to mark any matching numbers.
        // If a cell's value matches the called number, replace it with 'O'.
        for (let gridCellPosition = 0; gridCellPosition < flatGameGrid.length; gridCellPosition++) {
            if (flatGameGrid[gridCellPosition] === currentNumberCalled) {
                flatGameGrid[gridCellPosition] = 'O'; // Mark the cell.
            }
        }
        
        // After marking, immediately check if a bingo has been achieved.
        // This allows for an early exit, as soon as a bingo is detected.
        if (verifyBingoStatus(flatGameGrid)) {
            finalGameResult = 'Yes'; // Set the result to 'Yes'.
            break; // Stop processing further numbers as the game is decided.
        }
    }

    // Output the final determination of whether a bingo was achieved.
    console.log(finalGameResult);
};

// Standard input reading mechanism for JavaScript in competitive programming environments.
// Reads all content from standard input, decodes it as UTF-8, removes leading/trailing whitespace,
// and splits it into an array of lines, which are then passed to our game function.
executeBingoGame(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));