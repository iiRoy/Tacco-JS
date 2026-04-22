/*
 * This JavaScript code defines a primary function 'Main'
 * which processes a given input string.
 *
 * It's structured to read input from standard input,
 * typically used in competitive programming environments.
 */
function   Main (   input   )
{
    // The first step is to clean up the input string.
    // We remove any leading or trailing whitespace.
    input   =   input.trim( ) ; // Assigning the trimmed input back to the variable.

    /*
     * The line below is a commented-out section from the original code.
     * It suggests an alternative parsing method that was not active.
     * //  input = input.split(" ").map(Number);
     */

    // Finally, we perform the core logic: a simple arithmetic calculation.
    // The result of this calculation is then printed to the console.
    console.log(   24   +   (   24   -   input   )   )   ;
}

// This is the entry point for execution.
// It reads the entire content of '/dev/stdin' as UTF-8,
// and then passes it to the 'Main' function for processing.
Main(   require("fs").readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;