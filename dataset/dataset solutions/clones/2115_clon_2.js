function ProcessInput(rawData) {
    let linesOfData = rawData.split('\n');

    const gridMatrix = [];
    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
        gridMatrix[rowIdx] = linesOfData[rowIdx].split(' ');
    }

    const totalQueries = parseInt(linesOfData[3]); // Convert the count of numbers to an integer
    const queryValues = [];
    for (let currentQueryIndex = 0; currentQueryIndex < totalQueries; currentQueryIndex++) {
        queryValues.push(linesOfData[currentQueryIndex + 4]);
    }

    // Compare each cell of the 3x3 grid against the list of numbers to be checked.
    // A separate matrix is created to mark cells that are found.
    const matchFlags = [];
    for (let r = 0; r < 3; r++) {
        matchFlags.push([0, 0, 0]); // Initialize each row with zeroes
    }

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            for (let q = 0; q < queryValues.length; q++) {
                if (gridMatrix[r][c] === queryValues[q]) {
                    matchFlags[r][c] = 1; // Mark as found
                }
            }
        }
    }

    // Proceed to determine if any winning pattern (Bingo) has been achieved.
    let gameWonIndicator = 0;

    for (let currentOuterIndex = 0; currentOuterIndex < 3; currentOuterIndex++) {
        let currentHorizontalMatches = 0;
        let currentVerticalMatches = 0;
        let mainDiagonalElementCheck = 0;
        let antiDiagonalElementCheck = 0;

        for (let currentInnerIndex = 0; currentInnerIndex < 3; currentInnerIndex++) {
            // Evaluate horizontal matches for the current row
            if (matchFlags[currentOuterIndex][currentInnerIndex]) {
                currentHorizontalMatches++;
            }
            // Evaluate vertical matches for the current column
            if (matchFlags[currentInnerIndex][currentOuterIndex]) {
                currentVerticalMatches++;
            }
        }

        // Check the specific element on the main diagonal for the current row index
        if (matchFlags[currentOuterIndex][currentOuterIndex]) {
            mainDiagonalElementCheck++;
        }
        // Check the specific element on the anti-diagonal for the current row index
        if (matchFlags[currentOuterIndex][3 - currentOuterIndex]) { // Preserving the original's potentially out-of-bounds indexing for i=0
            antiDiagonalElementCheck++;
        }

        // If any line (horizontal, vertical, or diagonal element check) has 3 marked cells
        // (Note: Due to variable scoping, diagonal element checks will never reach 3 marked cells)
        if (currentHorizontalMatches === 3) {
            console.log('Yes');
            gameWonIndicator++;
            break;
        }
        if (currentVerticalMatches === 3) {
            console.log('Yes');
            gameWonIndicator++;
            break;
        }
        if (mainDiagonalElementCheck === 3) {
            console.log('Yes');
            gameWonIndicator++;
            break;
        }
        if (antiDiagonalElementCheck === 3) {
            console.log('Yes');
            gameWonIndicator++;
            break;
        }
    }

    // If no winning condition was met after checking all rows and columns
    if (gameWonIndicator === 0) {
        console.log('No');
    }
}

// Invoke the main processing function by reading input from standard input.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );