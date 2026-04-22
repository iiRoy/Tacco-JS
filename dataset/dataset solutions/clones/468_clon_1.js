// This function performs a 90-degree clockwise rotation on a 2D array (matrix).
function rotate ( arr ) {
    // L stores the index of the last row/column, assuming a square matrix.
    var L = arr.length - 1;

    // Create a deep copy of the input array to store the rotated result.
    // The .map(function(v){return v.slice();}) ensures a new array of new rows.
    var yx = arr.map( function ( v ) { return v.slice(); } );

    // Iterate through each row of the target matrix.
    for ( var i = 0; i <= L; i++ ) {
        // Iterate through each column of the target matrix.
        for ( var j = 0; j <= L; j++ ) {
            // The element at [i][j] in the new matrix comes from [L-j][i] in the original.
            // This is the core logic for 90-degree clockwise rotation.
            yx[ i ][ j ] = arr[ L - j ][ i ];
        } // End of inner loop (columns)
    } // End of outer loop (rows)

    // Return the newly rotated 2D array.
    return yx;
} // End of rotate function definition


// This function checks for a pattern match of a smaller matrix (yxM) within a larger matrix (yxN)
// starting at a specific top-left corner (a, b).
// It returns the coordinates of the first non-negative match, or false if no match or mismatch.
function check ( a, b ) {
    // 're' will store the coordinates of the first matched non-negative element from yxM.
    // Initialize to false, indicating no match found yet.
    var re = false;

    // Loop through the rows of the pattern matrix (yxM).
    for ( var y = 0; y < m; y++ ) {
        // Loop through the columns of the pattern matrix (yxM).
        for ( var x = 0; x < m; x++ ) {
            // If the current element in the pattern matrix is -1, it's a "wildcard" or "don't care",
            // so we skip this comparison and move to the next element.
            if ( yxM[ y ][ x ] == -1 )
                continue;

            // If this is the first non-negative element found in yxM that we are checking,
            // record its corresponding absolute coordinates in yxN.
            if ( re === false )
                re = [ a + y, b + x ];

            // Compare the element from the pattern (yxM) with the corresponding element
            // in the main matrix (yxN) at the current offset (a, b).
            // If they don't match, then the pattern does not fit at this position, so return false.
            if ( yxN[ a + y ][ b + x ] != yxM[ y ][ x ] )
                return false;
        } // End of inner loop (pattern columns)
    } // End of outer loop (pattern rows)

    // If all comparable elements matched, return the coordinates of the first match.
    return re;
} // End of check function definition


// Main program execution starts here.
// Read input from standard input, decode as UTF-8.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Trim whitespace from the input and split it into an array of lines.
var Arr = input.trim().split( "\n" );

// The main processing loop continues until a specific termination condition is met.
while ( true ) {
    // Read the first line of the current test case, split by space, and convert to numbers.
    // This line contains the dimensions N and M.
    var nm = Arr.shift().split( " " ).map( Number );

    // N is the size of the larger grid.
    var n = nm[ 0 ];
    // M is the size of the smaller pattern grid.
    var m = nm[ 1 ];

    // Check for the termination condition: N=0 and M=0.
    if ( n == 0 && m == 0 )
        break; // Exit the main loop.

    // Initialize an empty array to store the larger grid (yxN).
    var yxN = [];

    // Read the N rows for the larger grid.
    for ( var i = 0; i < n; i++ ) {
        // Each row is split by space and converted to numbers.
        var v = Arr.shift().split( " " ).map( Number );
        // Add the processed row to the yxN array.
        yxN.push( v );
    } // End of loop for reading yxN

    // Initialize an empty array to store the smaller pattern grid (yxM).
    var yxM = [];

    // Read the M rows for the smaller pattern grid.
    for ( var i = 0; i < m; i++ ) {
        // Each row is split by space and converted to numbers.
        var v = Arr.shift().split( " " ).map( Number );
        // Add the processed row to the yxM array.
        yxM.push( v );
    } // End of loop for reading yxM

    // Initialize 'min' array to store the minimum (row, col) coordinates found.
    // Initial values are arbitrarily large (101, 101) to ensure any valid coordinate will be smaller.
    var min = [ 101, 101 ];

    // Loop 4 times to check all four possible rotations of the pattern matrix (0, 90, 180, 270 degrees).
    for ( var k = 0; k < 4; k++ ) {
        // Iterate through all possible starting row positions for the pattern within the larger grid.
        // The pattern can start from row 0 up to row (N-M).
        for ( var i = 0; i <= n - m; i++ ) {
            // Iterate through all possible starting column positions for the pattern within the larger grid.
            // The pattern can start from column 0 up to column (N-M).
            for ( var j = 0; j <= n - m; j++ ) {
                // Call the 'check' function to see if the current rotation of yxM matches yxN
                // starting at position (i, j).
                var flag = check( i, j );

                // If 'flag' is not false, it means a match was found, and 'flag' contains the
                // absolute coordinates [row, col] of the first matching non-negative element.
                if ( flag !== false ) {
                    // Adjust flag coordinates to be 1-indexed for output: flag[0]+1, flag[1]+1.
                    // If the current match's row is smaller than the best row found so far,
                    // update 'min' with these new coordinates.
                    if ( min[ 0 ] > flag[ 0 ] + 1 )
                        min = [ flag[ 0 ] + 1, flag[ 1 ] + 1 ];

                    // If the current match's row is equal to the best row found so far,
                    // then check the column. If the current match's column (0-indexed) is smaller
                    // than the best column (1-indexed) found so far,
                    // update 'min' with these new 1-indexed coordinates.
                    if ( min[ 0 ] == flag[ 0 ] + 1 && min[ 1 ] > flag[ 1 ] )
                        min = [ flag[ 0 ] + 1, flag[ 1 ] + 1 ];
                } // End of if (flag !== false)
            } // End of inner loop (pattern column start position j)
        } // End of middle loop (pattern row start position i)

        // After checking all positions for the current rotation, rotate the pattern matrix for the next iteration.
        yxM = rotate( yxM );
    } // End of rotation loop (k)

    // After checking all rotations and positions, print the result.
    // If 'min' is still at its initial value (101, 101), it means no match was found, so print "NA".
    // Otherwise, print the 1-indexed column and then row (min[1] min[0]).
    console.log( ( min.join( "" ) == "101101" ) ? "NA" : min[ 1 ] + " " + min[ 0 ] );

} // End of main while loop