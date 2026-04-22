/*
 * This JavaScript file contains code designed to perform a specific calculation.
 * It is a Type I clone, meaning its functionality and structure are identical
 * to an original source, with only variations in whitespace and comments.
 *
 * Strict mode is enabled to catch common coding errors and "unsafe" actions.
 */

'use strict' ; // Enforce stricter parsing and error handling in the code.

// Define the primary function responsible for processing the input and
// executing the core logic of the program.
const   main    =   (   input   )   =>   {

    // First, process the raw input string.
    // It's expected to be a multi-line string where each line is a number.
    // We split it by newline characters, then parse each resulting string
    // into an integer.
    input   =   input . split ( '\n' ) . map (   v   =>   parseInt (   v   )   ) ;

    // Extract the first two numbers from the processed input array.
    // N typically represents the number of iterations or steps.
    const   N   =   input [ 0 ] ;

    // K typically represents a maximum limit or a constant value used in calculations.
    const   K   =   input [ 1 ] ;

    // Initialize a variable 'current' to a starting value of 1.
    // This variable will be modified iteratively within the loop.
    let   current   =   1 ;

    // Begin a 'for' loop that will execute N times.
    // The loop counter 'i' starts from 1 and goes up to N, inclusive.
    for (   let   i   =   1 ;   i   <=   N ;   i ++   )   {
        // Inside the loop, calculate an 'add' value.
        // This 'add' value is the minimum of K and the current 'current' value.
        // This logic ensures that 'current' grows, but not more than K in a single step,
        // and also effectively doubles 'current' if current < K.
        let   add   =   Math . min (   K ,   current   ) ;

        // Update the 'current' value by adding the calculated 'add' value to it.
        current   +=   add ;
    }

    // After the loop has completed all its iterations,
    // print the final calculated 'current' value to the console.
    console . log (   current   ) ;

} ; // End of the main function definition.

// This section handles the program's execution entry point.
// It reads input from standard input (/dev/stdin), which is common in
// competitive programming environments. The input is read as a UTF-8 string.
// The read content is then passed to the 'main' function for processing.
main (   require ( 'fs' ) . readFileSync (   '/dev/stdin' ,   'utf-8'   )   ) ;

/*
 * End of the program.
 * All modifications were strictly limited to whitespace and comments
 * to preserve the exact structure and logic of the original code.
 */