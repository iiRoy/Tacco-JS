(function (sourceText) {
    // This helper function determines if a square region within the grid,
    // starting at (colCoord, rowCoord) with a given dimension,
    // consists entirely of '.' characters.
    function checkSquare(colCoord, rowCoord, dim) {
        // Iterate through rows within the potential square.
        for (var rowIdx = rowCoord; rowIdx <= rowCoord + dim; rowIdx++) {
            // Iterate through columns within the potential square.
            for (var colIdx = colCoord; colIdx <= colCoord + dim; colIdx++) {
                // If any cell in the specified square region is not a '.',
                // then it's not a valid square of '.' characters.
                if (gridData[rowIdx][colIdx] !== '.') {
                    return false;
                }
            }
        }
        // If the loops complete, all cells in the square were '.',
        // so it is a valid square.
        return true;
    }

    // Process the raw input text: remove carriage returns and split by newline.
    var inputLines = sourceText.replace(/\r/g, '').split("\n");
    var gridData; // Stores the current grid for processing.
    var gridDim; // Stores the dimension (N) of the current square grid.
    var outerLoopIdx; // General purpose loop index for outer loops.
    var innerLoopIdx; // General purpose loop index for inner loops.

    // Main processing loop for multiple test cases.
    while (true) {
        // Read the grid dimension for the current test case.
        gridDim = parseInt(inputLines.shift());

        // If the dimension is 0, it signifies the end of input.
        if (gridDim === 0) {
            break; // Exit the processing loop.
        }

        gridData = []; // Initialize an empty array to store the grid rows.
        // Populate the grid with N rows from the input.
        for (outerLoopIdx = 0; outerLoopIdx < gridDim; outerLoopIdx++) {
            gridData.push(inputLines.shift());
        }

        // This variable will store the maximum side length of a square
        // composed entirely of '.' characters found in the current grid.
        var maxSquareDim = 1;

        // Iterate through each cell of the grid to find the largest square.
        for (outerLoopIdx = 0; outerLoopIdx < gridDim; outerLoopIdx++) {
            for (innerLoopIdx = 0; innerLoopIdx < gridDim;) {
                // Check if a square of the current 'maxSquareDim' size
                // can be formed starting at the current (innerLoopIdx, outerLoopIdx) position.
                if (checkSquare(innerLoopIdx, outerLoopIdx, maxSquareDim)) {
                    maxSquareDim++; // If a square of this size is found, try for a larger one.
                } else {
                    // If not, move the innerLoopIdx forward by the current 'maxSquareDim'
                    // to avoid re-checking the same invalid region.
                    innerLoopIdx += maxSquareDim;
                }
            }
        }
        // Output the largest square dimension found for the current grid.
        console.log(maxSquareDim);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
