/*
 * This JavaScript code defines a function for rotating a 2D matrix
 * and then applies this rotation multiple times to an input matrix
 * read from standard input, logging the results.
 *
 * The 'move' function performs a 90-degree clockwise rotation
 * on an 8x8 matrix represented as a 2D array.
 */

function move ( yx )
{
    // Initialize a new array to hold the rotated matrix.
    // This will be an 8x8 matrix.
    var arr = [ ] ;

    // Populate the outer array with empty inner arrays (rows).
    // This ensures 'arr' is an array of 8 empty arrays.
    for ( var y = 0 ; y < 8 ; y ++ )
    {
        arr [ y ] = [ ] ;
    }

    // Outer loop: Iterate through the rows of the *new* array (arr).
    for ( var y = 0 ; y < 8 ; y ++ )
    {
        // Inner loop: Iterate through the columns of the *new* array (arr).
        for ( var x = 0 ; x < 8 ; x ++ )
        {
            // The core rotation logic:
            // An element at (y, x) in the new array 'arr'
            // comes from the element at (7 - x, y) in the original array 'yx'.
            // This transforms the matrix by rotating it 90 degrees clockwise.
            arr [ y ] [ x ] = yx [ 7 - x ] [ y ] ;
        }
    }

    // Return the newly constructed, rotated matrix.
    return arr ;
}


// --- Main program execution begins here ---

// Use Node.js 'fs' module to synchronously read the entire content
// of standard input ('/dev/stdin') as a UTF-8 encoded string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Process the raw input string:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array of lines, using newline characters as delimiters.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Declare and initialize an empty array that will store
// the 2D matrix parsed from the input lines.
var yx = [ ] ;

// Loop through the first 8 lines of the input array.
// Each line is expected to be a row of the 8x8 matrix.
for ( var i = 0 ; i < 8 ; i ++ )
{
    // Split each line into an array of individual characters.
    // Then, push this character array (representing a row) into 'yx'.
    yx . push ( Arr [ i ] . split ( "" ) ) ;
}


// Perform the first 90-degree rotation.
// The 'move' function returns the rotated matrix, which then overwrites 'yx'.
yx = move ( yx ) ;

// Log the result of the 90-degree rotation to the console.
// The output starts with "90\n" followed by the rows of the rotated matrix,
// joined by newline characters.
console . log ( "90\n" + yx . join ( "\n" ) ) ;


// Perform the second 90-degree rotation (total 180 degrees from original).
// Again, 'yx' is updated with the new rotated matrix.
yx = move ( yx ) ;

// Log the result of the 180-degree rotation.
// NOTE: The original code contains a syntax error here (missing '+' operator).
// This error is preserved as per Type I clone definition.
console . log ( "180\n" yx . join ( "\n" ) ) ;


// Perform the third 90-degree rotation (total 270 degrees from original).
// 'yx' is updated for the final time.
yx = move ( yx ) ;

// Log the result of the 270-degree rotation.
// NOTE: The original code contains a syntax error here (missing '+' operator).
// This error is preserved as per Type I clone definition.
console . log ( "270\n" yx . join ( "\n" ) ) ;