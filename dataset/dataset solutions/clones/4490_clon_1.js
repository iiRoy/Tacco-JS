/*
 * This is a JavaScript file demonstrating
 * a simple function for processing input.
 * It strictly adheres to the 'use strict' mode.
 */

'use strict' ; // Enable strict mode for better error handling and cleaner code.


// Define the main function that takes input as a string.
function   Main  (   INPUT   )
{

    // Process the input string.
    // First, split by newline, take the first line, then split by space.
    const   input   =   INPUT .   split   (   "\n"   )   [   0   ]   .   split   (   " "   )   ;

    // Sort the array of string numbers numerically.
    // The arrow function (a, b) => a - b ensures a numeric sort.
    input .   sort   (   (   a   ,   b   )   =>   a   -   b   )   ;


    // Convert the first two sorted numbers to integers and sum them up.
    // parseInt(string, radix) is used to ensure base 10 conversion.
    console .   log   (
        parseInt   (   input   [   0   ]   ,   10   )
        +
        parseInt   (   input   [   1   ]   ,   10   )
    )   ;

}


// Execute the Main function with input read from standard input.
// require("fs") is used to access the file system module.
// readFileSync reads the file synchronously.
// "/dev/stdin" is the standard input path on Unix-like systems.
// "utf8" specifies the encoding for the input.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;