/* This script reads input from stdin, processes it, and prints a result.
 * It calculates a 'count' based on specific arithmetic operations.
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Process the input string: trim whitespace and split into an array of lines.
var arr = input . trim() . split( "\n" ) ;


// Main processing loop: continues until a specific termination condition is met.
while ( true ) {

    // Get the next line from the array.
    var str = arr . shift() ;

    // Check for the termination condition.
    if ( str == "0 0 0 0 0 0" ) {
        // If the condition is met, exit the loop.
        break ;
    }

    // Split the string into numbers and convert them to actual Number types.
    var ary = str . split( " " ) . map( Number ) ;

    // Calculate initial sums for MD, GG, and GO based on array elements.
    var MD = ary[0] + ary[3] ;  // Sum of 1st and 4th elements
    var GG = ary[1] + ary[4] ;  // Sum of 2nd and 5th elements
    var GO = ary[2] + ary[5] ;  // Sum of 3rd and 6th elements

    // Initialize counter.
    var cnt = 0 ;

    // Add contributions to 'cnt' from MD, GG, GO based on multiples of 3.
    // This effectively calculates floor(MD/3), floor(GG/3), floor(GO/3).
    cnt += ( MD - ( MD % 3 ) ) / 3 ;
    cnt += ( GG - ( GG % 3 ) ) / 3 ;
    cnt += ( GO - ( GO % 3 ) ) / 3 ;

    // Update MD, GG, GO to their remainders when divided by 3.
    MD = MD % 3 ;
    GG = GG % 3 ;
    GO = GO % 3 ;

    // Further processing loop: decrement MD, GG, GO and increment cnt if all are >= 1.
    // This handles combinations of 1s from the remainders.
    while ( MD % 3 >= 1 && GG >= 1 && GO >= 1 ) {
        MD -- ; // Decrement MD
        GG -- ; // Decrement GG
        GO -- ; // Decrement GO
        cnt ++ ; // Increment the total count
    }

    // Output the final calculated count for the current line of input.
    console . log( cnt ) ;

} // End of main while loop