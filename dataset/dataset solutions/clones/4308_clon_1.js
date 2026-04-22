/*
 * This JavaScript file processes a single line of input.
 * It's designed to extract a specific prefix from a string
 * that is expected to end with "FESTIVAL".
 *
 * This script utilizes strict mode for cleaner code and better error handling.
 */
'use strict'; // Enforces strict mode throughout the script.

// Define the primary function that orchestrates the logic.
const   main    =   (   input   )   =>  {
    /*
     * The 'input' parameter is expected to be a string.
     * First, split the input string by newline characters ('\n').
     * Then, for each resulting line, split it by spaces (' ').
     * This creates an array of arrays, representing parsed arguments.
     */
    const   args    =   input   .   split   (   '\n'    )   .   map   (
        // Callback function for the map operation.
        // It takes an 'arg' (a line from the input) and splits it by spaces.
        arg     =>  arg   .   split   (   ' ' )
    )   ;

    // From the parsed arguments, we extract the very first element.
    // This assumes the target string is at args[0][0].
    const   S       =   args    [   0   ]   [   0   ]   ; // Variable 'S' holds the primary string to be processed.

    /*
     * Apply a regular expression to the string 'S'.
     * The pattern /^(.+)FESTIVAL$/ matches any string that starts with one or more characters (captured in group 1)
     * and ends specifically with "FESTIVAL".
     * The 'match' method returns an array containing the full match and any captured groups, or null if no match.
     */
    const   md      =   S   .   match   (   /^(.+)FESTIVAL$/    )   ;

    // The captured group (the part before "FESTIVAL") is located at index 1 of the 'md' array.
    // This value is then printed to the standard output.
    console .   log   (   md  [   1   ]   )   ;
}   ; // End of the 'main' function definition.


// This section handles reading input from the file system and invoking the main function.
// It uses Node.js's 'fs' module to read the content of '/dev/stdin'.
main    (
    // Require the 'fs' (file system) module.
    require (   'fs'    )
    // Read the file synchronously from the specified path.
    .   readFileSync    (
        '/dev/stdin',   // Standard input path on Unix-like systems.
        'utf8'          // Specify UTF-8 encoding for proper character handling.
    )
)   ; // Function call to 'main' completes here.