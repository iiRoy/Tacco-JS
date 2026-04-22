/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered.
 *
 * Extensive changes have been made to whitespace and comments
 * to visually differentiate it from the original source.
 */


// Define the primary function responsible for processing the input data.
function   Main ( input )
{

    // Declare a local variable 'dn'.
    // It stores the result of splitting the first element of the 'input' array
    // by a single space character. This operation typically parses
    // numeric values from a string.
    var    dn    =    input[ 0 ] . split ( " " ) ;

    // Output the computed result to the console.
    // The calculation involves several steps:
    // 1. Math.pow(100, dn[0]): Calculates 100 raised to the power of the first parsed number.
    // 2. ... * dn[1]: Multiplies the result from step 1 by the second parsed number.
    // 3. Math.round(...): Rounds the final product to the nearest whole integer.
    // The '%d' format specifier ensures the output is treated as an integer.
    console . log ( '%d' , Math . round ( Math . pow ( 100 , dn [ 0 ] ) * dn [ 1 ] ) ) ;

} // End of the Main function definition


// This section handles the program's execution flow.
// It reads input from the standard input stream, processes it,
// and then invokes the Main function with the prepared data.

Main (
        require ( "fs" ) // Access the Node.js 'fs' (file system) module.
            . readFileSync ( "/dev/stdin" , "utf8" ) // Read the content of '/dev/stdin' as a UTF-8 string.
            . split ( "\n" ) // Split the entire content string into an array of lines, using newline as a delimiter.
) ; // Call the Main function, passing the array of input lines.

// The script finishes execution after the Main function completes.