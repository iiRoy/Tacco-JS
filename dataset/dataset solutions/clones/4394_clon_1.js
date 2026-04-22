// This is a JavaScript program designed to solve a specific problem.
// It takes a string of space-separated numbers as input.

/*
 * The main function processes the input and determines
 * whether 'A' or 'B' should be printed based on a comparison.
 */
function   Main ( input )   {
    // First, we parse the input string into an array of numbers.
    // The input is expected to be space-separated values.
    const   numbers   =   input .   split (   ' '   ) .   map (   n   =>   Number (   n   )   ) ;


    // Extract individual values from the parsed numbers array.
    // These represent the coordinates or values for comparison.
    const   x   =   numbers [   0   ]   ;
    const   a   =   numbers [   1   ]   ;
    const   b   =   numbers [   2   ]   ;

    // Now, we perform the core logic: a conditional comparison.
    // We are comparing the absolute difference between 'x' and 'a'
    // against the absolute difference between 'x' and 'b'.
    if (   Math .   abs (   x   -   a   )   >   Math .   abs (   x   -   b   )   )
    {
        // If the difference between x and a is greater, print 'B'.
        console .   log (   'B'   )   ;
    }
    else
    {
        // Otherwise (if it's less than or equal), print 'A'.
        console .   log (   'A'   )   ;
    }
} // End of Main function definition.


// This section handles the program execution, reading input from standard input.
// It uses Node.js specific modules to read the entire file synchronously.
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;

// Program execution concludes here.