/* This is a Type I clone of a JavaScript program.
 * The purpose of this code is to solve a dynamic programming problem.
 * Only whitespace and comments have been altered from the original.
 * All identifiers, operators, and expressions remain identical.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; /* Read input from standard input stream */

var arr = input . trim ( ) . split ( "\n" ) ; // Process input: trim whitespace and split into lines

while ( true ) { // Main processing loop: continues until a specific termination condition is met

    // Extract N and M values from the current line of input
    var nm = arr . shift ( ) . split ( " " ) ;

    // Check for the termination condition: "0 0"
    if ( nm . join ( " " ) == "0 0" ) {
        break ; // Exit the while loop if the termination condition is met
    }

    var n = nm [ 0 ] ; // Assign the first part of nm to variable n
    var m = nm [ 1 ] ; // Assign the second part of nm to variable m

    var M = [ ] ; // Initialize array M

    // Populate array M with numbers from the input
    for ( var i = 0 ; i < m ; i ++ ) {
        M . push ( arr . shift ( ) - 0 ) ; // Convert string to number using '- 0'
    }

    var N = [ ] ; // Initialize array N

    // Populate array N with numbers from the input
    for ( var i = 0 ; i < n ; i ++ ) {
        N . push ( arr . shift ( ) - 0 ) ; // Convert string to number
    }

    var dp = [ ] ; // Declare and initialize the dynamic programming table

    // Initialize the DP table with dimensions (n+1) x 256
    for ( var i = 0 ; i <= n ; i ++ ) {
        dp [ i ] = [ ] ; // Create the inner array for each row

        // Fill each cell in the current row with Infinity
        for ( var j = 0 ; j <= 255 ; j ++ ) {
            dp [ i ] [ j ] = Infinity ;
        }
    }

    dp [ 0 ] [ 128 ] = 0 ; // Set the base case for the DP table

    // Main dynamic programming computation
    for ( var i = 1 ; i <= n ; i ++ ) { // Iterate through items from 1 to n
        for ( var j = 0 ; j <= 255 ; j ++ ) { // Iterate through all possible states (0-255)
            for ( var k = 0 ; k < m ; k ++ ) { // Iterate through elements of array M
                var jm = j + M [ k ] ; // Calculate the new state jm

                // Clamp jm to be within the valid range [0, 255]
                if ( jm < 0 ) {
                    jm = 0 ;
                }
                if ( jm > 255 ) {
                    jm = 255 ;
                }

                // If the previous state dp[i-1][j] was reachable (not Infinity)
                if ( dp [ i - 1 ] [ j ] != Infinity ) {
                    // Update dp[i][jm] with the minimum cost
                    dp [ i ] [ jm ] = Math . min ( dp [ i ] [ jm ] , dp [ i - 1 ] [ j ] + Math . pow ( N [ i - 1 ] - jm , 2 ) ) ;
                }
            }
        }
    }

    var min = Infinity ; // Initialize a variable to find the minimum value

    // Iterate through the last row of the DP table (dp[n]) to find the overall minimum
    dp [ n ] . forEach ( function ( v ) {
        min = Math . min ( min , v ) ; // Update 'min' if a smaller value is found
    } ) ;

    console . log ( min ) ; // Output the calculated minimum value for the current test case
} // End of the while loop