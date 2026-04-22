/*
 * This JavaScript code defines a function to process numerical input
 * and determine a specific output based on calculated absolute differences.
 * It's structured to read input from standard input, process it,
 * and then log a result to the console.
 *
 * This particular implementation is a Type I clone, meaning
 * its functionality and core structure are identical to an original,
 * with only variations in whitespace and comments.
 */
function   Main (   input   )   { // The primary function definition begins here.

    // First, the incoming input string is expected to contain space-separated values.
    // It is split into an array of substrings based on the space delimiter.
    input   =   input .   split (   " "   )   ;


    // Next, we calculate the absolute difference between the first
    // and second elements of the parsed input array.
    var   a   =   Math .   abs (   input [   0   ]   -   input [   1   ]   )   ;

    // Similarly, we calculate the absolute difference between the first
    // and third elements of the parsed input array.
    var   b   =   Math .   abs (   input [   0   ]   -   input [   2   ]   )   ;


    // Now, a conditional check is performed to compare these two calculated differences.
    if   (   a   >   b   )   {
        // If the first difference ('a') is strictly greater than the second ('b'),
        // the character "B" is printed to the console.
        console .   log (   "B"   )   ;
    }   else   {
        // Otherwise (meaning 'a' is less than or equal to 'b'),
        // the character "A" is printed to the console.
        console .   log (   "A"   )   ;
    }
}   // End of the Main function block.


// This line invokes the Main function.
// It reads data from standard input (/dev/stdin) using Node.js's 'fs' module,
// specifically the readFileSync method, encoding it as UTF-8,
// and then passes this string content as the 'input' argument to Main.
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;