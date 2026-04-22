/* This is a Type I clone of some JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments are altered.
 * All identifiers, operators, and expressions remain identical.
 */

var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;    // Reads input from standard input.


var   Arr   =   (   input . trim ( )   ) . split ( "\n" ) ;   // Processes the input string into an array of lines.

/*
 * The main processing loop begins here.
 * It continues until a specific condition (n === 0) is met.
 */
while ( true )
{
    var    n    =    Arr . shift ( )    -    0 ;    // Extracts the first number from the array and converts it to a number.

    if ( n    ==    0 )
        break ;  // If n is zero, the loop terminates.


    var    p    =    Arr . shift ( ) . split ( " " ) . map ( Number ) ;   // Extracts player scores for the current round.

    var    j    =    Arr . shift ( ) . split ( " " ) . map ( Number ) ;   // Extracts joker values for the current round.

    var    sum    =    p . reduce ( function ( a , b ) {    return    a + b ; } ) ;  // Calculates the sum of player scores.

    j . sort ( function ( a , b ) {    return    b - a ; } ) ;   // Sorts the joker values in descending order.

    var    max    =    sum    *    n ;   // Initializes the maximum possible score.

    // This section was originally a misplaced comment end. It is now a proper comment block.
    /*
     * This inner loop iterates through the sorted joker values
     * to calculate potential maximum scores.
     */
    while ( true )
    {
        if ( j . length    ==    0 )
            break ;   // Exit the inner loop if there are no more joker values.

        n -- ;   // Decrement 'n' for the next calculation.

        max = Math . max ( max , ( sum + j . shift ( ) ) * n ) ;   // Updates the maximum score.
    }
    // Another misplaced comment end, now a proper comment.
    /* End of inner loop processing. */

    console . log ( max ) ;   // Prints the calculated maximum score for the current round.
}
// End of the main program loop.