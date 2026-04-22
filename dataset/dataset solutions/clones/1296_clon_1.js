/* This JavaScript code reads input from /dev/stdin,
 * processes it to find combinations of three distinct numbers (i, j, k)
 * such that their sum equals a target value x,
 * given a maximum number n for i, j, and k.
 * It's structured to handle multiple test cases until n=0 and x=0 are encountered.
 */

// Import the 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Trim any leading/trailing whitespace from the input string
// and then split it into an array of lines based on the newline character.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Loop through each line in the Arr array.
for ( var I = 0 ;  I < Arr . length ;  I ++ ) {

    // For each line, split it by space to get two numbers (n and x).
    // The map(Number) function converts the string parts to actual numbers.
    var nx = Arr [ I ] . split ( " " ) . map ( Number ) ;

    // n represents the upper limit for the numbers i, j, k.
    var n = nx [ 0 ] ;
    // x represents the target sum for i + j + k.
    var x = nx [ 1 ] ;

    // This is the termination condition for the entire program.
    // If both n and x are 0, it means there are no more test cases.
    if ( n == 0  &&  x == 0 ) {
        /* Exit the main loop. */
        break ;
    }

    // Initialize a counter for valid combinations.
    var cnt = 0 ;

    // Outer loop for the first number 'i'.
    // 'i' ranges from 1 to n.
    for ( var i = 1 ;  i <= n ;  i ++ ) {

        // Inner loop for the second number 'j'.
        // 'j' must be greater than 'i' to ensure distinct numbers and avoid duplicates.
        // 'j' also ranges up to n.
        for ( var j = i + 1 ;  j <= n ;  j ++ ) {

            // Optimization: If the sum of i and j already exceeds or equals x,
            // then any subsequent 'k' (which must be greater than j) would make i+j+k even larger.
            // So, we can break from this inner 'j' loop.
            if ( i + j >= x ) {
                // No need to check further 'j' values for this 'i'.
                break ;
            }

            // Calculate the third number 'k' needed to reach the target sum 'x'.
            var k = x - ( i + j ) ;

            // Check if 'k' is a valid number:
            // 1. 'k' must be greater than 'j' (to ensure i, j, k are distinct and in increasing order).
            // 2. 'k' must not exceed 'n' (the upper limit).
            if ( k > j  &&  k <= n ) {
                // If both conditions are met, we found a valid combination.
                cnt ++ ;
            }
        } // End of inner loop for 'j'.
    } // End of outer loop for 'i'.

    // After checking all possible combinations for the current n and x,
    // print the total count of valid combinations.
    console . log ( cnt ) ;

} // End of main loop for test cases.