(function (rawInputString) {
    /**
     * @description Determines if the entire N x N grid is composed exclusively of '*' characters.
     *              If true, it implies no '.' (empty) squares exist.
     * @param {number} matrixDimension - The side length (N) of the square grid.
     * @param {string[]} currentGrid - An array of strings, each representing a row of the grid.
     * @returns {boolean} True if all cells are '*', false if any '.' is found.
     */
    function checkAllStarsPresent(matrixDimension, currentGrid) {
        // Handle edge cases for an empty or non-positive dimension grid.
        // Such a grid, by convention, contains no '.' characters.
        if (matrixDimension <= 0 || !currentGrid || currentGrid.length === 0) {
            return true;
        }

        // Iterate through each row and column of the grid.
        for (let rowIndex = 0; rowIndex < matrixDimension; ++rowIndex) {
            for (let colIndex = 0; colIndex < matrixDimension; ++colIndex) {
                // If any cell is not a '*', then the grid is not entirely filled with stars.
                if (currentGrid[rowIndex][colIndex] !== '*') {
                    return false;
                }
            }
        }
        return true; // All cells were '*'
    }

    /**
     * @description Checks if a square sub-grid, starting at a given coordinate and with a calculated side length,
     *              consists entirely of '.' (empty) characters.
     * @param {number} startCol - The column index (x-coordinate) of the top-left corner of the potential square.
     * @param {number} startRow - The row index (y-coordinate) of the top-left corner of the potential square.
     * @param {number} currentMaxSideLength - The current maximum side length (K) of a '.' square found so far.
     *                                        This function will test for a square of size (K+1) x (K+1).
     * @param {string[]} matrixReference - The array of strings representing the main grid.
     * @returns {boolean} True if the (currentMaxSideLength+1) x (currentMaxSideLength+1) square is all '.', false otherwise.
     */
    function verifyEmptySubGrid(startCol, startRow, currentMaxSideLength, matrixReference) {
        // Calculate the actual side length of the square being tested.
        // If currentMaxSideLength is K, we are checking for a (K+1)x(K+1) square.
        const testSquareSide = currentMaxSideLength + 1;

        // Perform robust boundary checks.
        // Ensure the starting coordinates are within valid bounds and non-negative.
        // Ensure the entire potential square fits within the matrix's overall dimensions.
        if (startRow < 0 || startCol < 0 ||
            startRow + testSquareSide > matrixReference.length ||
            startCol + testSquareSide > matrixReference[0].length) { // Assumes a non-empty grid for matrixReference[0].length
            return false; // The square extends beyond the matrix boundaries or has invalid starting point.
        }

        // Iterate through each cell within the bounds of the potential square.
        for (let currYCoord = startRow; currYCoord < startRow + testSquareSide; ++currYCoord) {
            for (let currXCoord = startCol; currXCoord < startCol + testSquareSide; ++currXCoord) {
                // If any cell is not a '.', then this is not an empty square.
                if (matrixReference[currYCoord][currXCoord] !== '.') {
                    return false;
                }
            }
        }
        return true; // All cells within the test square were '.'
    }

    // Prepare the input: remove potential carriage returns and split into individual lines.
    let inputLines = rawInputString.split(/\r?\n/);
    let gridMatrix = []; // This array will hold the grid data for each test case.
    let gridDimension = 0; // Stores the N dimension for the current square grid.
    let rowIterator, colIterator; // General-purpose loop iterators.

    /**
     * @description A utility function to extract and parse the next integer from the input lines array.
     * @returns {number} The parsed integer value.
     */
    const getNextInteger = () => Number.parseInt(inputLines.shift(), 10);

    // Main loop: Processes multiple test cases sequentially.
    // The loop continues indefinitely until a specific termination condition is met.
    while (true) {
        gridDimension = getNextInteger(); // Read the dimension (N) for the current test case's grid.

        // Termination condition: A grid dimension of 0 signals the end of input.
        if (gridDimension === 0) {
            break;
        }

        // Reset the grid matrix for the new test case and populate it with N lines of input.
        gridMatrix = [];
        for (rowIterator = 0; rowIterator < gridDimension; ++rowIterator) {
            gridMatrix.push(inputLines.shift());
        }

        // Phase 1: Initial check for grids with no '.' characters.
        // If the entire grid is made of '*', no empty squares exist, so the max side length is 0.
        if (checkAllStarsPresent(gridDimension, gridMatrix)) {
            console.log(0);
        } else {
            // Phase 2: Search for the largest square of '.' characters.
            // 'currentMaxSide' stores the largest side length (K) of a '.' square found so far.
            // It's initialized to 1 because we know at least a 1x1 square exists (otherwise checkAllStarsPresent would be true).
            let currentMaxSide = 1;

            // Iterate through every possible top-left cell (colIterator, rowIterator) in the grid.
            for (rowIterator = 0; rowIterator < gridDimension; ++rowIterator) {
                // The column iterator is handled specially within this loop,
                // allowing it to jump based on search results.
                for (colIterator = 0; colIterator < gridDimension; ) {
                    // Attempt to find a square of size (currentMaxSide + 1) x (currentMaxSide + 1)
                    // starting at the current (colIterator, rowIterator) position.
                    // The 'currentMaxSide' parameter passed to verifyEmptySubGrid means we're checking
                    // for a square one size larger than what we've currently confirmed.
                    if (verifyEmptySubGrid(colIterator, rowIterator, currentMaxSide, gridMatrix)) {
                        currentMaxSide++; // If a larger square is found, increment 'currentMaxSide'
                                          // to try searching for an even larger one in subsequent checks.
                    } else {
                        // If no larger square is found at the current position,
                        // advance the column pointer by 'currentMaxSide'.
                        // This is a greedy heuristic: if a (K+1)x(K+1) square isn't found starting here,
                        // we jump forward by K cells, assuming no (K+1)x(K+1) square can begin
                        // within the skipped portion that would have been covered by a potential (K+1)x(K+1) square.
                        colIterator += currentMaxSide;
                    }
                }
            }
            // Output the largest side length (K) found for any KxK square of '.' characters.
            console.log(currentMaxSide);
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));