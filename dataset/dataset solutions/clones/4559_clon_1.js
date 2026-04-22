/* This JavaScript file is a Type I clone.
 * It is functionally identical to the original source code.
 * All variable names, function names, operators, and expressions are preserved.
 * Only whitespace and comments have been extensively modified to achieve visual difference.
 */

'use strict'   ; // Enforces stricter parsing and error handling in the code.

/**
 * Main function to process the input and determine the output.
 * @param {string} INPUT - The raw input string from stdin.
 */
function   Main (   INPUT   )
{
    // Split the input string first by newline, take the first line,
    // then split that line by space to get individual values.
    const   input    =   INPUT . split ( "\n" ) [0] . split ( " " ) ;

    // Parse the first value as an integer (base 10) for variable 'x'.
    const   x   =   parseInt (   input [0]   ,   10   ) ;
    // Parse the second value as an integer (base 10) for variable 'y'.
    const   y   =   parseInt (   input [1]   ,   10   ) ;

    // Define array 'a' containing month numbers that have 31 days.
    const   a   =   [   1   ,   3   ,   5   ,   7   ,   8   ,   10   ,   12   ]   ;
    // Define array 'b' containing month numbers that have 30 days.
    const   b   =   [   4   ,   6   ,   9   ,   11   ]   ;

    // Evaluate the complex conditional statement.
    // The conditions check for specific relationships between x and y,
    // particularly if they are 'compatible' months based on the problem's rules.
    if   (
            (   x   ==   2   &&   x   ==   y   )   ||   // Condition 1: Both x and y are February (month 2).
            (   a . indexOf (   x   )   >=   0   &&   a . indexOf (   y   )   )   ||   // Condition 2: Both x and y are 31-day months.
            b . indexOf (   x   )   >=   0   &&   b . indexOf (   y   )   // Condition 3: Both x and y are 30-day months.
        )
    {
        // If any of the above conditions are true, print "Yes".
        console . log (   "Yes"   )   ;
    }
    else
    {
        // Otherwise, if none of the conditions are met, print "No".
        console . log (   "No"   )   ;
    }
}   // End of the Main function definition.


// Read input from standard input (stdin) using Node.js 'fs' module,
// convert it to UTF-8, and pass it to the Main function.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;