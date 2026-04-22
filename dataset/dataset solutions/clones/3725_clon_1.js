/*
 * This JavaScript program defines a function named 'Main'
 * which processes an input string to calculate and print a specific
 * numerical result. It handles a few edge cases related to the input values.
 *
 * The problem appears to involve some form of division or distribution,
 * with special conditions for certain input values.
 */
function   Main   (   s   )
{
    // The input 's' is initially a single string containing data.
    // It's crucial to first break this string down into its constituent parts.
    // We split 's' by either newline characters ('\n') or any whitespace ('\s').
    // This produces an array of strings, where each element is a piece of the original input.
    s   =   s   .   split   (   /\n|\s/   )   ;


    // The first element of the array, s[0], is expected to be a number.
    // We convert it to an integer using the bitwise OR operator with 0.
    // This is a common and efficient JavaScript idiom for integer conversion,
    // effectively truncating any decimal part.
    s   [   0   ]   |   =   0   ;


    // Similarly, the second element, s[1], is also converted to an integer.
    // This ensures that subsequent arithmetic operations are performed on numerical values.
    s   [   1   ]   |   =   0   ;


    // Initialize the primary answer variable 'ans'.
    // The initial calculation involves dividing s[0] by (s[1] - 1)
    // and then taking the ceiling of the result (rounding up to the nearest integer).
    // This forms the base calculation for most cases.
    var   ans   =   Math   .   ceil   (   s   [   0   ]   /   (   s   [   1   ]   -   1   )   )   ;


    // Check for a specific edge case: if the value of s[1] is exactly 2.
    // This condition often indicates a unique scenario in problem statements.
    if   (   s   [   1   ]   ==   2   )
    {
        // If s[1] is 2, the 'ans' is simply s[0] minus 1.
        // This overrides the initial ceiling division calculation.
        ans   =   s   [   0   ]   -   1   ;
    }
    // If the first condition is not met, check another specific edge case.
    // This condition applies if the remainder of s[0] divided by (s[1] - 1) is 1.
    else   if   (   (   s   [   0   ]   %   (   s   [   1   ]   -   1   )   )   ==   1   )
    {
        // In this particular scenario, decrement the 'ans' by 1.
        // This adjustment handles a boundary condition that might arise from the ceiling division.
        ans   --   ;
    }


    // Finally, print the calculated 'ans' value to the console.
    // This is the output of the program.
    console   .   log   (   ans   )   ;
}

// The following code executes the 'Main' function.
// It reads the entire content of the standard input file (typically "/dev/stdin" on Linux-like systems)
// as a UTF-8 encoded string.
// This string is then passed as the argument 's' to the 'Main' function for processing.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;