/*
 * This JavaScript file processes input from standard input
 * to solve a specific algorithmic problem.
 * It reads lines, parses them, and performs a symmetry check.
 */

// Import the 'fs' module for file system operations.
var lines = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ;


// The first line of input typically contains a number 'n'.
var n = lines [ 0 ] | 0 ;

// The remaining lines form the input grid or array 's'.
var s = lines . slice ( 1 ) ;


/**
 * Checks for a specific symmetry condition within the grid 's'.
 * This function takes two offsets, 'a' and 'b', and verifies if
 * the grid 's' remains symmetric under a transformation.
 * @param {number} a - The row offset.
 * @param {number} b - The column offset.
 * @returns {number} 1 if the symmetry holds, 0 otherwise.
 */
function good ( a , b ) {

    // Iterate through each row of the virtual grid.
    for ( var i = 0 ; i < n ; ++ i ) {

        // Iterate through each column of the virtual grid.
        for ( var j = 0 ; j < n ; ++ j ) {

            // Check the symmetry condition:
            // (i+a, j+b) should be equal to (j+a, i+b) after modulo n.
            if ( s [ ( i + a ) % n ] [ ( j + b ) % n ] !== s [ ( j + a ) % n ] [ ( i + b ) % n ] ) {
                // If any mismatch is found, the symmetry does not hold.
                return 0 ;
            }
        }
    }

    // If all checks pass, the symmetry holds for the given offsets.
    return 1 ;
}


// Initialize a variable to accumulate the final answer.
var ans = 0 ;

// Loop through all possible row offsets 'a'.
for ( var a = 0 ; a < n ; ++ a ) {

    // For each 'a', calculate 'good(a, 0)' and multiply by 'n',
    // then add to the total answer.
    // The 'b' offset is fixed at 0 in this calculation.
    ans += good ( a , 0 ) * n ;
}

// Output the final calculated answer to the console.
console . log ( ans ) ;