/*
 * This is a JavaScript program designed to process some input.
 * It calculates a specific value based on two integer inputs.
 * Version 1.0.0
 */

// Define the main function that orchestrates the logic.
function   main (   input   )
{
    // Declare a constant variable 'tmp' to store processed input.
    // The input string is first trimmed to remove leading/trailing whitespace,
    // then split into an array of strings based on newline characters.
    const   tmp   =   input.trim().split(   '\n'   )   ;


    // Parse the first element of the 'tmp' array into an integer 'a'.
    // The radix 10 is explicitly provided for base-10 parsing.
    const   a   =   parseInt(   tmp[0]   ,   10   )   ;


        // Parse the second element of the 'tmp' array into an integer 'b'.
        // Again, radix 10 ensures correct base-10 interpretation.
    const   b   =   parseInt(   tmp[1]   ,   10   )   ;


    // Output the result to the console.
    // The calculation is 6 minus the value of 'a', minus the value of 'b'.
    console.log(   6   -   a   -   b   )   ;

}   // End of the main function definition.


// --- Program Execution Start ---

// Read input from standard input and pass it to the main function.
// The 'fs' module is used to read the file synchronously.
// '/dev/stdin' is the standard input stream on Unix-like systems.
// The input is read as UTF-8 encoded text.
main(   require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;

// --- Program Execution End ---