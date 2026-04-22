/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered significantly.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );

// Process the input string: remove trailing newline, then split into an array of lines.
var Arr = ( input . replace ( /\n$/ , "" ) ) . split ( "\n" );

// Extract the first element from Arr, convert it to a number, and store in 'n'.
// This 'n' typically represents the number of test cases or iterations.
var n = Arr . shift ( ) - 0 ;

// Loop 'n' times, processing each line of input as a separate case.
for ( var i = 0 ; i < n ; i ++ ) {

    // Split the current line (Arr[i]) by spaces and convert each part to a number.
    var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

    // 's' is the starting number for the sequence.
    var s = arr [ 0 ] ;

    // 'g' is the goal number for the sequence.
    var g = arr [ 1 ] ;

    // Initialize the answer array with the starting number.
    var ans = [ s ] ;

    // 'plus' determines the increment/decrement value for the complex case.
    var plus = 1 ;

    // --- Conditional logic to generate the sequence based on 's' and 'g' ---

    // Case 1: 's' is less than 'g'. Increment 's' until it reaches 'g'.
    if ( s < g ) {
        do {
            s ++ ;
            ans . push ( s ) ;
        } while ( s != g ) ;
    }
    // Case 2: 's' is greater than 'g' and 's' is small (<= 5). Decrement 's' until it reaches 'g'.
    else if ( s > g && s <= 5 ) {
        do {
            s -- ;
            ans . push ( s ) ;
        } while ( s != g ) ;
    }
    // Case 3: 's' is greater than 'g' and 's' is large (>= 6). Complex logic with wrap-around.
    else if ( s > g && s >= 6 ) {
        do {
            s += plus ; // Apply 'plus' (initially 1, can become -1).

            // If 's' reaches 10, reset to 5 and reverse direction.
            if ( s == 10 ) {
                s = 5 ;
                plus = - 1 ;
            } ;

            // If 's' reaches 0, reverse direction.
            if ( s == 0 ) {
                plus = 1 ;
            } ;

            ans . push ( s ) ; // Add current 's' to the answer.
        } while ( s != g ) ; // Continue until 's' equals 'g'.
    }

    // Print the generated sequence, joining elements with a space.
    console . log ( ans . join ( " " ) ) ;

} // End of the main processing loop.