/* This script processes input data to find the largest rectangle of '.' characters in a 2D grid.
 * It reads grid dimensions and content, then converts the grid into a series of histograms
 * to apply the largest rectangle in histogram algorithm. */
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input stream.

// For development purposes, overwrite the input stream with a predefined test case.
dataSource = '2 4\n...*\n.*..\n0 0';

var inputLines = dataSource  .trim()  .split("\n"); // Prepare input by splitting into individual lines.

// Begin processing multiple grid configurations until a termination signal is encountered.
while (  true  ) {
    // Extract grid dimensions (height and width) from the first line of the current configuration.
    var dimensionsTuple = inputLines.shift().split(" ").map(Number);

    // Check for the termination condition "0 0" indicating no more grids to process.
    if ( dimensionsTuple.join(" ") === "0 0" ) {
        break; // Exit the loop when termination signal is found.
    }

    var matrixHeight = dimensionsTuple[0]; // Store the height of the current grid.
    var matrixWidth = dimensionsTuple[1];  // Store the width of the current grid.

    /* Initialize a 2D array to store the calculated heights for each cell.
     * A cell's height represents the number of consecutive '.' characters directly above it (including itself). */
    var heightMatrix = [];

    // Iterate through each row of the input grid.
    for ( var rowCoordinate = 0; rowCoordinate < matrixHeight; rowCoordinate++ ) {
        var characterRow = inputLines.shift().split(""); // Get the character representation of the current row.
        heightMatrix[rowCoordinate] = []; // Initialize the current row in the height matrix.

        // Process each character within the current row.
        characterRow.forEach( function( cellContent, columnCoordinate ) {
            // If it's the first row:
            if ( rowCoordinate === 0 && cellContent === "." ) {
                heightMatrix[rowCoordinate][columnCoordinate] = 1; // '.' means height 1.
            } else if ( rowCoordinate === 0 && cellContent !== "." ) {
                heightMatrix[rowCoordinate][columnCoordinate] = 0; // Non-'.' means height 0.
            }
            // If it's not the first row:
            else if ( rowCoordinate !== 0 && cellContent === "." ) {
                heightMatrix[rowCoordinate][columnCoordinate] = heightMatrix[rowCoordinate - 1][columnCoordinate] + 1; // '.' means height increases by 1 from above.
            } else if ( rowCoordinate !== 0 && cellContent !== "." ) {
                heightMatrix[rowCoordinate][columnCoordinate] = 0; // Non-'.' means height 0.
            }
        } );
    }

    // Initialize the variable to store the largest area found across all rows.
    var maximumCalculatedArea = 0;

    // Iterate through each row of the height matrix, treating each row as a histogram.
    for ( var currentRowIndex = 0; currentRowIndex < matrixHeight; currentRowIndex++ ) {
        var histogramStack = []; // This stack will help in finding the largest rectangle in the current histogram.
        heightMatrix[currentRowIndex][matrixWidth] = 0; // Add a sentinel (zero height) at the end to clear the stack.

        // Iterate through each bar (column) of the current histogram.
        for ( var columnCoordinate = 0; columnCoordinate <= matrixWidth; columnCoordinate++ ) {
            var currentBarHeight = heightMatrix[currentRowIndex][columnCoordinate]; // Get the height of the current bar.

            if ( histogramStack.length === 0 ) {
                histogramStack.push( [ currentBarHeight, columnCoordinate ] ); // If stack is empty, push the current bar.
                continue; // Move to the next bar.
            }

            // If the current bar is taller than the top of the stack, push it.
            if ( histogramStack[histogramStack.length - 1][0] < currentBarHeight ) {
                histogramStack.push( [ currentBarHeight, columnCoordinate ] );
            }
            // If the current bar has the same height as the top of the stack, do nothing (effectively extending the previous one).
            else if ( histogramStack[histogramStack.length - 1][0] === currentBarHeight ) {
                continue;
            }
            // If the current bar is shorter than the top of the stack, start popping and calculating areas.
            else if ( histogramStack[histogramStack.length - 1][0] > currentBarHeight ) {
                var lastPoppedPosition = columnCoordinate; // Initialize `lastPoppedPosition` with the current column index.

                while ( true ) {
                    // If the stack becomes empty, push the current bar with the `lastPoppedPosition` and break.
                    if ( histogramStack.length === 0 ) {
                        histogramStack.push( [ currentBarHeight, lastPoppedPosition ] );
                        break;
                    }

                    var poppedElement = histogramStack.pop(); // Pop an element from the stack.

                    // If the current bar is taller than the popped one, push the current bar and break.
                    if ( currentBarHeight > poppedElement[0] ) {
                        histogramStack.push( [ currentBarHeight, lastPoppedPosition ] );
                        break;
                    }
                    // If the current bar has the same height as the popped one, break (no need to push it, it's already accounted for by `lastPoppedPosition`).
                    else if ( currentBarHeight === poppedElement[0] ) {
                        break;
                    }
                    // If the current bar is shorter or equal to the popped one, calculate the area.
                    else if ( currentBarHeight <= poppedElement[0] ) {
                        // Calculate the area using the popped bar's height and the width from its index to the current column.
                        maximumCalculatedArea = Math.max( maximumCalculatedArea, poppedElement[0] * ( columnCoordinate - poppedElement[1] ) );
                        lastPoppedPosition = poppedElement[1]; // Update `lastPoppedPosition` to the index of the popped bar.
                    }
                }
            }
        }
    }
    console.log( maximumCalculatedArea ); // Output the maximum area found for the current grid.
}