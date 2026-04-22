'use strict'; // Enforce strict parsing rules for the entire script.

function calculateGridPaths(rawData)
{
    // Split the entire input string into an array of individual text lines.
    const textRows = rawData.split('\n') ;

    // Extract the grid's dimensions (height and width) from the first line.
    // The first line is removed from the array and then parsed.
    const dimensionsArray = textRows.shift().split(' ').map(strVal => Number.parseInt(strVal)) ;

    const gridHeight = dimensionsArray[0] ; // The number of rows in the grid.
    const gridWidth  = dimensionsArray[1] ;  // The number of columns in the grid.

    // Initialize a 2D array to represent the layout of the grid, including obstacles.
    const obstacleGrid = [] ;
    for (var rowIndex = 0; rowIndex < gridHeight; rowIndex++)
    {
        // Each subsequent line provides the characters for one row of the grid.
        obstacleGrid.push(textRows.shift().split('')) ;
    }

    // Define a constant for modulo operation, used to keep path counts within range.
    const moduloConstant = 1_000_000_007 ;

    // Create a dynamic programming table (2D array) to store the number of ways
    // to reach each cell from the top-left corner (0,0).
    const pathwayCounts = [] ;
    for (var r = 0; r < gridHeight; r++)
    {
        pathwayCounts.push(Array(gridWidth).fill(0)) ;
    }

    // There is exactly one way to reach the starting cell (top-left).
    pathwayCounts[0][0] = 1 ;

    // Iterate through every cell in the grid, filling the pathwayCounts table.
    // The iteration proceeds row by row, and then column by column within each row.
    for (var r = 0; r < gridHeight; r++)
    {
        for (var c = 0; c < gridWidth; c++)
        {
            // If the cell directly above the current cell exists and is not an obstacle ('X')...
            if (r > 0 && obstacleGrid[r - 1][c] !== 'X') {
                // Add the number of ways to reach the cell above to the current cell's count.
                pathwayCounts[r][c] += pathwayCounts[r - 1][c] ;
            }

            // If the cell directly to the left of the current cell exists and is not an obstacle ('X')...
            if (c > 0 && obstacleGrid[r][c - 1] !== 'X') {
                // Add the number of ways to reach the cell to the left to the current cell's count.
                pathwayCounts[r][c] += pathwayCounts[r][c - 1] ;
            }

            // Apply the modulo operation to the current cell's count.
            // This prevents the number of pathways from exceeding the maximum integer value.
            pathwayCounts[r][c] %= moduloConstant ;
        }
    }

    // The final result is the total number of distinct pathways to reach the bottom-right cell
    // of the grid, located at (gridHeight-1, gridWidth-1).
    let finalPathways = pathwayCounts[gridHeight - 1][gridWidth - 1] ;

    // Output the final computed count of pathways to the console, ensuring it adheres to the modulo.
    console.log(finalPathways % moduloConstant) ;
}

// Read the input data from the standard input stream (e.g., from a file or piped content)
// and then pass it to the main processing function.
calculateGridPaths(require('fs').readFileSync('/dev/stdin', 'utf8')) ;