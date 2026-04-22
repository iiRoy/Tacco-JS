/*
 * This program processes a single integer input.
 * It's designed to solve a specific problem where an input number 'M'
 * is subtracted from a constant value, 48.
 */
function     Main   (   input   )
{
    // First, we parse the input string into an integer.
    // The 'input' parameter is expected to be a string.
    var     M     =     parseInt(  input  )   ;


    // Next, we calculate the answer.
    // The problem statement implies a calculation involving 48 and the input M.
    var   ans   =   48   -   M   ;


    // Finally, we output the computed answer to the standard output.
    // The '%d' format specifier is used for integer output.
    console .   log   (   '%d'   ,   ans   )   ;

}

// The following section is for handling standard input/output.
// It should remain untouched to ensure the program runs correctly
// in environments that use standard I/O streams.
// It reads the entire content from /dev/stdin synchronously.
Main   (   require("fs").readFileSync("/dev/stdin", "utf8")   )   ;