// This function performs a recursive depth-first search to find the maximum path sum
// through a grid, utilizing memoization to optimize calculations.
function traverseGrid( currentRow, currentColumn, currentPathSum )
{
    // Store the current path sum in the memoization table for the current cell.
    memoTable[ currentRow ][ currentColumn ] = currentPathSum;

    // Check if the current position is in the very last row of the grid.
    if ( currentRow === valueGrid.length - 1 )
    {
        // If it's the last row, update the global maximum result if the current path sum is greater.
        overallMaxResult = Math.max( overallMaxResult, currentPathSum );
    }
    // If the current row is in the upper half of the grid (strictly less than the middle row index).
    else if ( ( valueGrid.length - 1 ) / 2 > currentRow )
    {
        // Consider moving straight down to the next row, same column.
        // Only proceed if the new potential path sum is greater than the currently memoized value for that cell.
        if ( memoTable[ currentRow + 1 ][ currentColumn ] < currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn ] )
            traverseGrid( currentRow + 1, currentColumn, currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn ] );

        // Consider moving diagonally down-right to the next row, next column.
        // Similar check: only proceed if a better path is found.
        if ( memoTable[ currentRow + 1 ][ currentColumn + 1 ] < currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn + 1 ] )
            traverseGrid( currentRow + 1, currentColumn + 1, currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn + 1 ] );
    }
    // If the current row is in the lower half of the grid (including the middle row if the total number of rows is odd).
    else if ( ( valueGrid.length - 1 ) / 2 <= currentRow )
    {
        // Check for a valid move diagonally down-left (ensure column index doesn't go below zero).
        if ( currentColumn - 1 >= 0 )
        {
            // If valid, evaluate and potentially recurse for the down-left path.
            if ( memoTable[ currentRow + 1 ][ currentColumn - 1 ] < currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn - 1 ] )
                traverseGrid( currentRow + 1, currentColumn - 1, currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn - 1 ] );
        }

        // Check for a valid move straight down (ensure column index doesn't exceed row bounds).
        if ( currentColumn < valueGrid[ currentRow ].length - 1 )
        {
            // If valid, evaluate and potentially recurse for the straight-down path.
            if ( memoTable[ currentRow + 1 ][ currentColumn ] < currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn ] )
                traverseGrid( currentRow + 1, currentColumn, currentPathSum + valueGrid[ currentRow + 1 ][ currentColumn ] );
        }
    }
} // End of the 'traverseGrid' function.


// --- Global variable declarations and initial setup for input processing ---

// Read raw data from the standard input stream.
// This line imports the 'fs' module and synchronously reads the file content as a UTF-8 string.
var fileInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of lines using the newline character as a delimiter.
var inputLines = (fileInputData.trim()).split("\n");

// Initialize two arrays to store the grid values and the memoization table.
var valueGrid = []; // Will hold the numeric values parsed from input.
var memoTable = []; // Will store the maximum path sums for memoization.

// Iterate over each line in the processed input array.
inputLines.forEach(function(currentLineFragment)
{
    // For each line fragment:
    // 1. Split the string by commas to get an array of string representations of numbers.
    // 2. Convert each string representation to an actual numeric type.
    var numericRowValues = currentLineFragment.split(",").map(Number);

    // Create a corresponding row for the memoization table, initialized with zeros.
    var zeroInitializedRow = numericRowValues.map(function(elementPlaceholder){return 0;});

    // Add the parsed numeric row to the value grid.
    valueGrid.push(numericRowValues);
    // Add the corresponding zero-initialized row to the memoization table.
    memoTable.push(zeroInitializedRow);
});

// Initialize the variable that will store the overall maximum path sum found.
var overallMaxResult = 0;

// Start the grid traversal from the top-left corner (index 0,0),
// with the initial path sum being the value at that starting cell.
traverseGrid(0, 0, valueGrid[0][0]);

// Output the final calculated overall maximum path sum to the console.
console.log(overallMaxResult);