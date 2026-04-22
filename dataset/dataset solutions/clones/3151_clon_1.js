// This directive enables strict mode for the entire script.
// It helps in writing cleaner and safer JavaScript code.
"use strict" ;


// This is the primary function that processes the input argument.
const main =     arg    =>
{
        // Parse the first integer from the first line of the input string.
        // It extracts the first space-separated token.
        const     A     =     parseInt ( arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ) ;


        // Parse the second integer from the first line of the input string.
        // This extracts the second space-separated token.
        const     B     =     parseInt ( arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] ) ;


        // Parse the third integer from the first line of the input string.
        // This extracts the third space-separated token.
        const     C     =     parseInt ( arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 2 ] ) ;


        // Calculate the floor division of B by A.
        // Then, compare this result with C.
        // If floor(B/A) is greater than or equal to C, output C.
        // Otherwise, output floor(B/A).
        console . log (    Math . floor (   B   /   A   )   >=   C   ?   C   :   Math . floor (   B   /   A   )    ) ;
    }
// End of the 'main' function definition.


// This line reads the input from standard input, using Node.js 'fs' module.
// It reads the entire file at '/dev/stdin' as a UTF-8 string.
// The read content is then passed as an argument to the 'main' function for processing.
main (    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )    ) ;