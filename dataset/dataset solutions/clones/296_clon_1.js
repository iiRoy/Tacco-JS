/*
 * This JavaScript code defines a recursive function to find the maximum sum
 * along paths in a numeric grid, typically a triangular or diamond-shaped
 * structure. It then reads input from stdin to construct such a grid
 * and finally calls the function to compute and print the result.
 */

/*
 * The 'bomb' function is a recursive helper that explores paths in the 'yx' grid.
 * It uses a depth-first search approach to sum values along valid paths.
 *
 * @param {number} y   The current row index in the 'yx' array.
 * @param {number} x   The current column index in the current row.
 * @param {number} sum The accumulated sum of values from the start to the current position.
 */
function bomb ( y, x, sum )
{
    // Base case: If we have reached the very last row of the grid.
    // At this point, the current path sum is complete, so we compare it
    // with the globally tracked maximum sum and update if necessary.
    if ( y == yx . length - 1 )
    {
        max = Math . max( max, sum ) ; // Update 'max' if 'sum' is greater.
    }
    // Recursive case 1: If we are in the upper half of the grid (before its widest row).
    // In this phase, movement is generally downwards and to the right or straight down.
    else if ( ( yx . length - 1 ) / 2 > y )
    {
        // Explore moving one step down, staying in the same column.
        // The 'x+0' is redundant but explicitly shows no horizontal movement.
        bomb( y + 1, x + 0, sum + yx[ y + 1 ][ x ] ) ;

        // Explore moving one step down and one step to the right.
        bomb( y + 1, x + 1, sum + yx[ y + 1 ][ x + 1 ] ) ;
    }
    // Recursive case 2: If we are in the lower half of the grid (from its widest row onwards).
    // In this phase, movement is generally downwards and to the left or straight down.
    else if ( ( yx . length - 1 ) / 2 <= y )
    {
        // Check if moving one step down and one step to the left is a valid move.
        // We must ensure the column index 'x-1' is not less than 0.
        if ( x - 1 >= 0 )
        {
            bomb( y + 1, x - 1, sum + yx[ y + 1 ][ x - 1 ] ) ; // Move left.
        }

        // Check if moving one step down, staying in the same column, is a valid move.
        // We must ensure the column index 'x' is within the bounds of the next row.
        // Note: The original logic `x < yx[y].length-1` should be carefully preserved.
        if ( x < yx[ y ] . length - 1 )
        {
            bomb( y + 1, x + 0, sum + yx[ y + 1 ][ x ] ) ; // Move straight down.
        }
    }
}


// --- Main Program Execution Flow ---

// First, read all input data from the standard input stream.
// The 'fs' module is used for file system operations, and 'readFileSync'
// reads the content of '/dev/stdin' (standard input) synchronously.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ;


// Process the raw input string:
// 1. Remove any leading or trailing whitespace (e.g., newlines at the end).
// 2. Split the string into an array of individual lines, using the newline character as a delimiter.
var Arr = ( input . trim() ) . split( "\n" ) ;


// Initialize an empty array that will store our parsed grid data.
// Each element of 'yx' will be an array representing a row of numbers.
var yx = [] ;


// Iterate over each line string obtained from the input.
Arr . forEach( function ( v )
{
    // For each line 'v':
    // 1. Split the string by commas to get an array of string numbers.
    // 2. Use the 'map(Number)' function to convert each string number to an actual number.
    // This creates a row array of numeric values.
    var x = v . split( "," ) . map( Number ) ;

    // Add the newly created numeric row array to our 'yx' grid.
    yx . push( x ) ;
} ) ;


// Initialize a global variable 'max' to store the maximum sum found.
// It's set to 0 initially, assuming sums will be non-negative.
var max = 0 ;


// Kick off the recursive 'bomb' function.
// It starts at the top-left corner of the grid (row 0, column 0).
// The initial sum includes the value of the starting cell itself.
bomb( 0, 0, yx[ 0 ][ 0 ] ) ;


// Finally, print the maximum sum found to the console.
console . log( max ) ;