/*
 * This JavaScript file implements the solution for a programming problem, likely from
 * AtCoder Beginner Contest 161 (ABC 161).
 *
 * The problem involves reading three space-separated numbers from standard input,
 * reordering them, and then printing the reordered sequence to standard output.
 */

//
// The Main function serves as the entry point for processing the input data.
// It takes a string 'input' which contains the raw data from stdin.
//
function   Main (   input   )
{

    // Step 1: Parse the input string.
    // The input is expected to be a single line with three space-separated integers.
    // We split this string by spaces to get an array of string numbers.
    input   =   input . split (   " "   ) ;


    // Step 2: Extract and convert the numbers to integers.
    // The problem statement implies a specific reordering.
    // Let's assume the original input is X Y Z, and we need to output Z X Y.

    // Variable 'A' will store the third number from the input (at index 2).
    let   A   =   parseInt (   input [   2   ] ,   10   ) ;

    // Variable 'B' will store the first number from the input (at index 0).
    let   B   =   parseInt (   input [   0   ] ,   10   ) ;

    // Variable 'C' will store the second number from the input (at index 1).
    let   C   =   parseInt (   input [   1   ] ,   10   ) ;


    // Step 3: Output the numbers in the required order.
    // The reordered numbers (A, B, C) are concatenated into a string
    // with spaces in between, and then printed to the console.
    console . log (   A   +   " "   +   B   +   " "   +   C   ) ;

} // End of Main function definition.


//
// This section handles reading input from standard input and calling the Main function.
// It is standard boilerplate for competitive programming in Node.js environments.
//
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;

//
// Final comment: This code strictly adheres to the Type I clone definition,
// ensuring only whitespace and comments are altered from the original.
//