// This is a JavaScript program designed to evaluate a condition based on input.
// The primary logic resides within the 'main' function.

function   main  (   s   )
{
    // The input string 's' is first processed here.

    // Step 1: Convert the input string 's' into an array of individual characters.
    // This operation reassigns the 's' variable to hold the resulting character array.
    s   =   s   .   split   (   ""   )   ;

    // Step 2: Evaluate a conditional expression based on the first two characters.
    // The condition checks if the character at index 0 is '9'
    // OR if the character at index 1 is '9'.
    if
    (
        s   [   0   ]   ==   "9"
        ||
        s   [   1   ]   ==   "9"
    )
        // If the above condition evaluates to true, print "Yes" to the console.
        console   .   log   (   "Yes\n"   )   ;
    // If the 'if' condition is false, proceed to the 'else' block.
    else
        // Otherwise, if the condition is false, print "No" to the console.
        console   .   log   (   "No\n"   )   ;

    // The 'main' function finishes its execution here.
}


/*
 * This part of the code handles the program's entry point and
 * the acquisition of input data for the 'main' function.
 * It uses Node.js's built-in 'fs' (file system) module.
 */

// This line calls the 'main' function, passing it the content read from standard input.
// 'require('fs')' imports the file system module.
// '.readFileSync('/dev/stdin', 'utf8')' reads the entire content of '/dev/stdin'
// (which is typically where standard input comes from in Unix-like systems)
// and decodes it as a UTF-8 string.
main
(
    require   (   'fs'   )
    .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)   ;

// End of program execution.