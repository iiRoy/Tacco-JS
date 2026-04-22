/*
 * This is a JavaScript file demonstrating a simple input processing logic.
 * The 'use strict' directive enforces stricter parsing and error handling.
 */
'use strict' /* Enable strict mode for better code quality */

/*
 * The main function that processes the input string.
 * It reads values, performs a conditional update, and prints the result.
 */
function         Main       (   input   )
{
    // Process the input: trim whitespace and split by newlines.
    input  =  input.trim ( ) . split ( '\n' ) ;

    // Destructure the first line into two string variables, S and T.
    const    [   S ,    T   ]    =    input[0]     .    split    (    '    '    ) ;

    // Parse the second line into an array of integers.
    const res       =    input [ 1 ] . split ( ' ' ) . map (    s    =>    parseInt ( s )    ) ;

    // Initialize variables A and B from the parsed array.
    let      A     =     res [ 0 ] ;
    let      B     =     res [ 1 ] ;

    // Get the third line which represents U.
    const      U      =      input [ 2 ] ;

    // Conditional logic: decrement A if U matches S, otherwise decrement B.
    if      (    U    ===    S    )
    {
        A     -=     1 ; // Decrement A
    }
    else
    {
        B     -=     1 ; // Decrement B
    }

    // Output the final values of A and B, separated by a space.
    console.log (    `${A} ${B}`    ) ;

} // End of Main function definition

// Call the Main function with input read from standard input.
// This part handles reading from /dev/stdin in a typical competitive programming setup.
Main (    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )    ) ;

/*
 * End of the JavaScript program.
 * This program demonstrates basic string manipulation, array operations,
 * conditional statements, and console output.
 */