/*
 * This JavaScript file defines a function 'Main'
 * which processes input data.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */

// Define the primary function for processing input.
function   Main
(
    input // The string input to be processed.
)
{
    // Declare an array variable. It will hold parsed input parts.
    var     arr     =     [ ]     ;


    // Split the input string by spaces.
    // This operation populates the 'arr' variable.
    arr     =     input .   split (   ' '   )     ;


    // Extract the first element from the array.
    // This is expected to be a number (as a string initially).
    var     a     =     arr [   0   ]     ;

    // Extract the second element from the array.
    // This is also expected to be a number (as a string initially).
    var     b     =     arr [   1   ]     ;


    // Calculate an initial difference.
    // Note: 'b' and 'a' will be implicitly converted to numbers here.
    var     diff     =     b     -     a     ;


    // Initialize a variable to store the accumulated result.
    var     result     =     1     ;


    // --- Start of a loop for calculation ---
    // This loop runs a fixed number of iterations.
    for
    (
        diff     =     1     ;             // Loop initialization: 'diff' starts at 1.
        diff     <=     999     ;         // Loop condition: continues as long as 'diff' is less than or equal to 999.
        diff ++                             // Loop increment: 'diff' is incremented by 1 after each iteration.
    )
    {
        // Accumulate the current value of 'diff' into 'result'.
        // The '=+'' operator is a shorthand for 'result = result + diff'.
        result     =+     diff     ;
    }
    // --- End of the calculation loop ---


    // Calculate the final value to be displayed.
    // This involves subtracting 'a' from the accumulated 'result'.
    // The result is then printed to the console (standard output).
    console .   log (     result     -     a     )     ;
}


/*
 * This section handles the execution of the 'Main' function.
 * It reads content from the standard input stream ('/dev/stdin')
 * using Node.js's file system module.
 */
// Invoke the Main function with the content read from standard input.
Main
(
    require (   "fs"   ) .   readFileSync
    (
        "/dev/stdin" ,    // Path to the standard input file.
        "utf8"            // Encoding to use for reading the file.
    )
)     ;