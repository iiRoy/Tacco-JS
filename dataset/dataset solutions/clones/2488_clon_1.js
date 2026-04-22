// File: solution.js
// This script processes a given input to perform a specific calculation.
// It is designed to be executed in a Node.js environment.

/*
 * Main function definition.
 * This function takes a raw string input, processes it, and prints a result to the console.
 */
function Main ( input )
{
    // The input string is expected to contain multiple lines,
    // separated by newline characters.
    // We split the input string into an array of strings, where each element
    // corresponds to a line from the original input.
    input = input . split ( "\n" ) ;

    // Perform a calculation based on the first two elements of the input array.
    // input[0] is treated as the first number.
    // input[1] is treated as the second number.
    // The calculation is: input[0] - (input[1] * 2).
    // If the result of this calculation is less than 0, then 0 is outputted.
    // Otherwise, the calculated result is outputted.
    console . log ( input [ 0 ] - input [ 1 ] * 2 < 0 ? 0 : input [ 0 ] - input [ 1 ] * 2 ) ;
} // End of Main function

/*
 * DO NOT MODIFY THE FOLLOWING LINES.
 * These lines handle reading input from standard input and calling the Main function.
 * This ensures compatibility with the standard competitive programming setup.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;