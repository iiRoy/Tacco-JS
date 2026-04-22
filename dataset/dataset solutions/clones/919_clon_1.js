/*
 * This JavaScript program reads input from standard input,
 * processes it, and then prints a result based on a conditional check.
 *
 * Author: Code Clone Generator
 * Date: Today
 */


// --- Variable Declaration and Input Processing ---

var   input   =   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   ) ;


// This line reads four numbers from the input string.
// It first trims whitespace, splits by space, and then converts each part to a Number.
var   [   a   ,   b   ,   c   ,   d   ]   =   input .   trim (   ) .   split (   " "   ) .   map (   Number   ) ;


// --- Conditional Logic for Output ---

if
(
        (   a   +   b   +   1   )   %   2   ==   0
    &&
        (   a   *   b   +   1   )   %   2
)
{
    // If both conditions are true, print "No".
    console .   log (   "No"   ) ;
}
else
{
    // Otherwise, if at least one condition is false, print "Yes".
    console .   log (   "Yes"   ) ;
}


// End of program execution.