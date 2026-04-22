// This is a Type I clone of the original JavaScript code.
// The primary goal is to maintain exact functional equivalence
// while introducing extensive variations in whitespace and comments.

/*
 *  Function: main
 *  Description: This function processes a given input string,
 *               parses it to extract numerical targets,
 *               and calculates their product.
 *  Parameter: input - A string containing multiple lines of data.
 */
function   main   (   input   )   {

    // Step 1: Parse the input string into an array of lines.
    // The input is expected to be newline-separated.
    const    args     =     input     .     split     (     '\n'     )     ;


    /*
     *  Step 2: Extract the target numbers from the second line of input.
     *  The numbers are assumed to be space-separated.
     *  'args[1]' refers to the second line (0-indexed).
     */
    var      targets      =      args     [     1     ]     .     split     (     ' '     )     ;

    // Step 3: Initialize a variable 'sum' to 1.
    // This variable will store the cumulative product of the target numbers.
    var      sum      =      1      ;


    // Step 4: Iterate through the target numbers and calculate their product.
    // The loop count is determined by the first line of input ('args[0]').
    // JavaScript's type coercion will convert 'args[0]' from string to number for the comparison.
    for     (     var     i     =     0     ;     i     <     args     [     0     ]     ;     i     ++     )     {
        // Multiply the current 'sum' by the current target number.
        // 'targets[i]' is a string, which will be coerced to a number during multiplication.
        sum      =      sum      *      targets     [     i     ]     ;
    }

    // Step 5: Output the final calculated product to the console.
    console     .     log     (     sum     )     ;

}    // End of the main function definition.


/*
 *  Program entry point:
 *  Reads input from standard input ('/dev/stdin') using Node.js 'fs' module.
 *  The input is read synchronously and decoded as UTF-8.
 *  This raw input string is then passed to the 'main' function for processing.
 */
main     (     require     (     'fs'     )     .     readFileSync     (     '/dev/stdin'     ,     'utf8'     )     )     ;

// End of the JavaScript program.
// No further code follows.