(function (rawData) {
    // This function checks if the entire grid is filled with '*' characters.
    function checkAllStars(dimension) {
        // Iterate through each row of the grid.
        for ( var rowIdx = 0; rowIdx < dimension; rowIdx++ ) {
            // Iterate through each column in the current row.
            for ( var colIdx = 0; colIdx < dimension; colIdx++ ) {
                // If any cell is not a star, the grid is not fully filled.
                if ( gridData[rowIdx][colIdx] !== String.fromCharCode(42) ) {
                    return !1; // Return boolean false.
                }
            }
        }
        return !0; // All cells are stars, return boolean true.
    }

    // This function verifies if a square of 'rectSize' dimensions,
    // starting at (startX, startY), consists entirely of '.' characters.
    function verifyRectangle(startX, startY, rectSize) {
        // Loop through the rows within the potential rectangle.
        for ( var currentY = startY; currentY <= startY + rectSize; currentY++ ) {
            // Loop through the columns within the potential rectangle.
            // Ensure the row 'gridData[currentY]' exists before accessing its elements.
            for ( var currentX = startX; gridData[currentY] && currentX <= startX + rectSize; currentX++ ) {
                // If any character within the bounds is not a dot, it's not a valid rectangle.
                if ( gridData[currentY][currentX] !== String.fromCharCode(46) ) {
                    return !1; // Return boolean false.
                }
            }
        }
        return !0; // All characters within the rectangle are dots, return boolean true.
    }

    // Process the raw input data: remove carriage returns and split into lines.
    var processedLines = rawData.replace(/\r/g, '').split("\n"),
        gridData, // Stores the current grid for processing.
        gridDimension, // Stores the dimension (N) of the square grid.
        outerLoopIdx, // General purpose loop index for outer loops.
        innerLoopIdx; // General purpose loop index for inner loops.

    // Main processing loop. Continues until a grid dimension of 0 is encountered.
    while ( !0 ) {
        // Parse the first line as the grid dimension.
        gridDimension = parseInt(processedLines.shift());

        // If the dimension is 0, terminate the program.
        if ( gridDimension === 0x0 ) {
            break;
        }

        // Initialize the grid for the current test case.
        gridData = [];
        // Populate the grid with 'gridDimension' lines from the input.
        for ( outerLoopIdx = 0; outerLoopIdx < gridDimension; outerLoopIdx++ ) {
            gridData.push(processedLines.shift());
        }

        // Check if the entire grid is filled with stars.
        if ( checkAllStars(gridDimension) ) {
            console.log(0x0); // If so, output 0.
        } else {
            // If not entirely filled with stars, find the largest square of dots.
            var currentRectSize = 0b1; // Start checking for a 1x1 square.

            // Iterate through each row of the grid.
            for ( outerLoopIdx = 0; outerLoopIdx < gridDimension; outerLoopIdx++ ) {
                // Iterate through each column of the grid.
                // The inner loop index 'innerLoopIdx' is incremented conditionally.
                for ( innerLoopIdx = 0; innerLoopIdx < gridDimension; ) {
                    // Check if a square of 'currentRectSize' exists at the current position.
                    if ( verifyRectangle(innerLoopIdx, outerLoopIdx, currentRectSize) ) {
                        currentRectSize++; // If it's a valid square, try to find a larger one.
                    } else {
                        // If not a valid square, move the starting column by the current size.
                        innerLoopIdx += currentRectSize;
                    }
                }
            }
            console.log(currentRectSize); // Output the maximum square size found.
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
