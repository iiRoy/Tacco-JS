/*
 * This is a Type I clone of a JavaScript function.
 * It processes input to calculate a total based on certain conditions.
 * The original code's logic is preserved exactly.
 */
function   main  ( arg )
{
    // Declare and initialize a temporary array from the input argument.
    var   temp  =  arg . split ( "\n" ) ;

    // Parse L and N from the first line of the input.
    var   L   =   parseInt ( temp [ 0 ] . split ( " " ) [ 0 ] ) ;
    var   N   =   parseInt ( temp [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Remove the first element as it's already processed.
    temp . shift ( ) ;

    // X now holds the remaining lines of input.
    var   X   =   temp ;

    // Initialize 'now' and 'total' variables.
    var   now   =   0 ;
    var   total   =   0 ;


    // Loop N times to process each segment.
    for  ( var   i   =   0 ;   i   <   N ;   i ++   )
    {
        /*
         * Extract 'left' and 'right' values.
         * Note: These are parsed from the beginning and end of the X array.
         */
        var   left   =   parseInt ( X [ 0 ] ) ;
        var   right   =   parseInt ( X [ X . length   -   1 ] ) ;

        // Calculate 'forward' and 'back' distances.
        // IMPORTANT: The original code contained a syntax error 'left - now)' with an extra parenthesis.
        // Per Type I definition, expressions must remain unchanged, so this error is preserved.
        var   forward   =   left   -   now ) ;
        var   back   =   ( L   -   right )   +   now ;

        // Debugging output for current state.
        console . log ( "now:"   +   now ) ;
        console . log ( "total:"   +   total ) ;

        // Decide whether to move forward or backward based on distances.
        if   ( forward   >   back )
        {
            // Move forward: update total, remove first element, update 'now'.
            total   =   total   +   ( forward ) ;
            X . shift ( ) ;
            now   =   left ;
        }
        else
        {
            // Move backward: update total, remove last element, update 'now'.
            total   =   total   +   ( back ) ;
            X . pop ( ) ;
            now   =   right ;
        }
    } // End of for loop.


    // Output the final calculated total.
    console . log ( total ) ;

} // End of main function definition.

/*
 * Call the main function with input read from stdin.
 * This part also undergoes whitespace and comment modifications.
 */
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )  ) ;