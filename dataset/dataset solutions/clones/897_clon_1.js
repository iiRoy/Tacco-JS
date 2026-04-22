/*
 * This JavaScript code processes directional input strings
 * to calculate a final angular sum.
 *
 * It reads input from standard input, processes each line,
 * and prints the result to the console.
 * The processing involves string manipulation and
 * iterative angular adjustments.
 */

// Import the 'fs' module to handle file system operations,
// specifically for reading input from /dev/stdin.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var arr = ( input . trim( ) ) . split ( "\n" ) ;

// Begin an infinite loop to process each line of input.
// The loop will terminate when a specific condition is met.
while ( true ) {

    // Retrieve the first line from the array and remove it.
    var str = arr . shift ( ) ;

    // Check for the termination condition: if the string is "#", exit the loop.
    if ( str == "#" )
        break ; // Exit the main processing loop.

    // Remove specific substrings ("orth" or "est") from the current string.
    str = str . replace ( /orth|est/g , "" ) ;

    // Reverse the modified string by splitting it into characters,
    // reversing the array, and then joining it back into a string.
    str = str . split ( "" ) . reverse ( ) . join ( "" ) ;

    // Initialize the sum variable to 0. This will accumulate the angle.
    var sum = 0 ;

    // Determine the initial angle based on the first character of the reversed string.
    if ( str [ 0 ] == "n" )
        sum = 0 ; // If 'n' (north), initial angle is 0 degrees.

    if ( str [ 0 ] == "w" )
        sum = 90 ; // If 'w' (west), initial angle is 90 degrees.

    // Iterate through the rest of the characters in the string,
    // starting from the second character (index 1).
    for ( var i = 1 ; i < str . length ; i++ ) {

        // If the character is 'n', subtract an angle.
        // The angle is 90 degrees divided by 2 raised to the power of the current index.
        if ( str [ i ] == "n" )
            sum -= 90 / Math . pow ( 2 , i ) ;

        // If the character is 'w', add an angle.
        // The angle is 90 degrees divided by 2 raised to the power of the current index.
        if ( str [ i ] == "w" )
            sum += 90 / Math . pow ( 2 , i ) ;
    }

    // Initialize a counter for fraction simplification.
    var i = 1 ;

    // Start another infinite loop to simplify the calculated sum into a fraction if necessary.
    while ( true ) {

        // Check if the sum multiplied by 'i' is an integer (i.e., has no fractional part).
        if ( ( sum * i ) % 1 == 0 ) {

            // If 'i' is 1, it means the sum was already an integer or a simple fraction.
            // No further simplification needed, so break.
            if ( i == 1 )
                break ;

            // If 'i' is greater than 1, convert the sum to a string representation of a fraction.
            // Format: "numerator/denominator".
            sum = "" + ( sum * i ) + "/" + i ;
            break ; // Exit the fraction simplification loop.
        }
        i++ ; // Increment 'i' to test the next possible denominator.
    }

    // Print the final calculated sum (or fraction) to the console.
    console . log ( sum ) ;
}

/*
 * End of script. All input lines have been processed.
 */