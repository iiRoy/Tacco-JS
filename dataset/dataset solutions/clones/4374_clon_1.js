// This JavaScript program processes numerical input to calculate a specific value.
// It adheres to strict mode for better code quality and error handling.
// The primary function `main` handles the core logic of parsing and computation.

'use strict' // Activates strict mode, helping to write cleaner and safer code.


const   main   =   (   input   )   =>   {
    // The input string is first split by newline characters to get individual lines.
    // Each line is then further split by spaces to obtain an array of arguments for that line.
    const   args   =   input   .   split   (   '\n'   )   .   map   (   arg   =>   arg   .   split   (   ' '   )   )


    // The first numerical value (X) is extracted from the first element of the first line.
    // `parseInt` is used to convert the string representation into an integer, with base 10 specified.
    const   X   =   parseInt   (   args   [   0   ]   [   0   ]   ,   10   )

    // The second numerical value (t) is extracted from the second element of the first line.
    // Similar to X, `parseInt` converts it to an integer.
    const   t   =   parseInt   (   args   [   0   ]   [   1   ]   ,   10   )


    // The program calculates the maximum of two values: 0 and the result of (X - t).
    // This ensures that the output is never negative.
    // The final computed value is then printed to the standard output.
    console   .   log   (   Math   .   max   (   0   ,   X   -   t   )   )
}


// This section handles reading the input from a file, typically standard input in competitive programming environments.
// `require('fs')` loads the Node.js file system module.
// `readFileSync` reads the content of '/dev/stdin' synchronously as a UTF-8 encoded string.
// The read content is then passed as an argument to the `main` function to initiate the processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )