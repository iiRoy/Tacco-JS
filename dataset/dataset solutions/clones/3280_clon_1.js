// This file contains a JavaScript program to calculate a specific value based on input.
// It's designed to solve a common programming puzzle.

/*
 * The main function processes input and performs calculations.
 * It takes a single argument, 'arg', which is expected to be a string.
 */
function   main (   arg   ) {


    // First, we split the input string by newline characters.
    // This assumes the input is a multi-line string where each line contains a relevant piece of data.
    arg =  arg.split (  "\n"  )   ;


    // Declare and initialize the variable N.
    // It's parsed as a number from the first element of the 'arg' array (index 0).
    var   N   =   Number (   arg[0]   )   ;

    // Declare and initialize the variable H.
    // It's parsed as a number from the second element of the 'arg' array (index 1).
    var   H   =   Number (   arg[1]   )   ;

    // Declare and initialize the variable W.
    // It's parsed as a number from the third element of the 'arg' array (index 2).
    var   W   =   Number (   arg[2]   )   ;


    // --- Core Calculation Logic ---

    // Calculate 'w' based on N and W, adding 1.
    // This often represents a "width" or "horizontal" dimension in a grid-like problem.
    var   w   =   N   -   W   +   1   ;

    // Calculate 'h' based on N and H, adding 1.
    // This often represents a "height" or "vertical" dimension.
    var   h   =   N   -   H   +   1   ;


    // Output the final result to the console.
    // The result is the product of 'w' and 'h'.
    console.log (   w   *   h   )   ;

}


// This section handles reading input from standard input and then calling the main function.
// It uses Node.js's 'fs' module to read the file '/dev/stdin'.
// The 'utf8' encoding is specified for the input.
main (   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the program.