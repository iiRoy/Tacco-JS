/* This file contains the main logic for processing input.
 * It strictly adheres to modern JavaScript practices. */
'use strict' ;


// This is the primary function that processes the given input string.
function Main ( inputs )
{
    // The input string is expected to be multi-line.
    // We split it by newline characters to get an array of lines.
    const input   =   inputs . split ( "\n" ) ;

    // From the first line of input, we extract three numerical values.
    // These values are space-separated.
    const a   =   Number ( input [ 0 ] . split ( ' ' ) [ 0 ] ) ; // First number
    const b   =   Number ( input [ 0 ] . split ( ' ' ) [ 1 ] ) ; // Second number
    const c   =   Number ( input [ 0 ] . split ( ' ' ) [ 2 ] ) ; // Third number


    // Now, we apply a series of conditional checks based on these numbers.
    // The problem statement defines these specific conditions.
    if ( c   -   a   -   b   <=   0 )
    {
        // If the condition (c - a - b <= 0) is met, output 'No'.
        console . log ( 'No' ) ;
    }
    else if ( 4   *   a   *   b   <   ( c   -   a   -   b )   *   ( c   -   a   -   b ) )
    {
        // If the first condition is false, but this second condition is true, output 'Yes'.
        // This condition checks if 4ab is less than (c - a - b) squared.
        console . log ( 'Yes' ) ;
    }
    else
    {
        // If neither of the above conditions are met, the default output is 'No'.
        console . log ( 'No' ) ;
    }
}


/*
 * The following section handles standard input/output operations.
 * It ensures that the 'Main' function receives the necessary data.
 * PLEASE DO NOT MODIFY ANYTHING BELOW THIS LINE.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;