/*
 * This is a recursive function named 'bomb' that explores paths
 * in a 2D grid structure represented by 'yx'.
 * It aims to find the maximum sum achievable along a valid path.
 *
 * The grid 'yx' is assumed to be a jagged array, where rows might have different lengths.
 * The 'bomb' function navigates through this grid based on specific rules:
 * - In the upper half, it can move straight down or diagonally down-right.
 * - In the lower half, it can move straight down or diagonally down-left, with boundary checks.
 *
 * @param {number} y   - The current row index in the 'yx' grid.
 * @param {number} x   - The current column index in the 'yx' grid.
 * @param {number} sum - The current accumulated sum along the path from the starting point to (y, x).
 */
function     bomb ( y , x , sum )
{


    // Base case: If the current row 'y' is the last row of the grid.
    // The grid's last row index is yx.length - 1.
    if ( y == yx . length - 1 )
    {
        // If we've reached the end of a path, compare the current path's 'sum'
        // with the globally tracked 'max' sum and update 'max' if the current sum is greater.
        max = Math . max ( max , sum ) ;
    }

    // Recursive case 1: If the current row 'y' is in the upper half of the grid.
    // The condition (yx.length - 1) / 2 > y checks if 'y' is strictly less than the middle row index.
    else     if ( ( ( yx . length - 1 ) / 2 ) > y )
    {

        // Explore the first possible move: move straight down to the next row (y+1) and same column (x).
        // The value at yx[y+1][x] is added to the current sum.
        bomb ( y + 1 , x + 0 , sum + yx [ y + 1 ] [ x ] ) ;

        // Explore the second possible move: move diagonally down-right to the next row (y+1) and next column (x+1).
        // The value at yx[y+1][x+1] is added to the current sum.
        bomb ( y + 1 , x + 1 , sum + yx [ y + 1 ] [ x + 1 ] ) ;
    }
    // Recursive case 2: If the current row 'y' is in the lower half of the grid
    // (including the middle row, if the length is odd).
    // The condition (yx.length - 1) / 2 <= y checks if 'y' is greater than or equal to the middle row index.
    else if ( ( ( yx . length - 1 ) / 2 ) <= y )
    {
        // Check for the first possible move: move diagonally down-left.
        // This move is only valid if the target column (x-1) is not out of bounds (i.e., x-1 >= 0).
        if ( x - 1 >= 0 )
            bomb ( y + 1 , x - 1 , sum + yx [ y + 1 ] [ x - 1 ] ) ;

        // Check for the second possible move: move straight down.
        // This move is only valid if the target column (x) is within the bounds of the next row (yx[y+1]).
        // Note: The original code uses yx[y].length-1 for the check, but accesses yx[y+1][x].
        // This implies the check might be intended for the current row's width, or there's a subtle grid structure.
        // Following the Type I clone rules, the condition remains exactly as provided.
        if ( x < yx [ y ] . length - 1 )
            bomb ( y + 1 , x + 0 , sum + yx [ y + 1 ] [ x ] ) ;
    }
}


// --- Global Variable Declarations and Initial Setup ---

// Import the 'fs' (file system) module to read input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw input string:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string into an array of lines, using the newline character as a delimiter.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize an empty array named 'yx'. This array will store the parsed 2D grid data.
var yx = [ ] ;


// Iterate over each line (string 'v') in the 'Arr' array.
Arr . forEach ( function ( v ) {
    // For each line:
    // 1. Split the string 'v' by the comma (',') character.
    // 2. Use the 'map(Number)' function to convert each resulting string part into a number.
    // The result is an array of numbers, representing a row in the grid.
    var x = v . split ( "," ) . map ( Number ) ;

    // Add this newly created row (array of numbers) to the 'yx' grid array.
    yx . push ( x ) ;
} ) ;


// After parsing all input lines, truncate the 'yx' array to keep only the first 9 rows.
// This ensures the grid has a maximum of 9 rows for processing.
yx = yx . slice ( 0 , 9 ) ;


// Initialize a global variable 'max' to 0. This variable will hold the maximum sum found by the 'bomb' function.
var max = 0 ;


// Start the recursive 'bomb' function.
// It begins at row 0, column 0, with an initial sum equal to the value at yx[0][0].
bomb ( 0 , 0 , yx [ 0 ] [ 0 ] ) ;


// Once the 'bomb' function completes its execution (i.e., all possible paths have been explored),
// print the final maximum sum found to the console.
console . log ( max ) ;

// End of script execution.