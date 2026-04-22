/*
 * This file contains a JavaScript program.
 * It's a Type I clone, meaning it's an exact copy
 * of another piece of code, differing only in
 * whitespace and comments.
 */

// Define the primary execution function for the program.
function   main ( input   )
{
    // Declare a variable 'a' and initialize it
    // by taking the first element of the input array
    // and ensuring it's treated as a number (the '-0' achieves this).
    var   a   =   input[0]   -   0   ;


    // Perform a calculation and output the result to the console.
    // The calculation involves taking the ceiling and floor of 'a' divided by 2,
    // then multiplying those two results together.
    console . log ( Math . ceil ( a   /   2 )   *   Math . floor ( a   /   2 ) ) ;
}

// This block handles the input mechanism for the 'main' function.
// It reads data from standard input, converts it to a string,
// removes any leading/trailing whitespace, and then splits it into an array of lines.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( "\n" ) )
// End of the program.