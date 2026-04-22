/*
 * This JavaScript file contains a simple program.
 * It demonstrates reading input from standard input
 * and printing a modified version of it to the console.
 */

// Define the primary function of this script.
// It takes a single argument, which is expected to be the input string.
function   main   (   input   )
{
    // Inside the main function, we perform a simple operation.

    // We use console.log to output a string to the standard output.
    // The string is a concatenation of "ABC" and the provided 'input' argument.
    console .   log   (   "ABC"   +   input   )   ;
}


// This section of the code is responsible for executing the main logic.

// First, we need to read data from the standard input.
// We achieve this by utilizing Node.js's built-in 'fs' (file system) module.
// The require() function is used to load this module.
// Then, readFileSync() is called to synchronously read the content of '/dev/stdin'.
// The 'utf8' encoding is specified to correctly interpret the input characters.
main   (   require (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the script execution.