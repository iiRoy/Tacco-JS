/*
 * This JavaScript module defines a core function to process a numerical input.
 * It calculates a specific value based on the input and prints the result.
 *
 * This file demonstrates a simple calculation pattern.
 */

function   Main  (  input  )
{
    // Step 1: Process the raw input string.
    // The input is expected to be a string representing a number.
    // We trim whitespace, split by space (assuming a single number input),
    // and then parse the first element as an integer.
    input =   parseInt(  input  .  trim()  .  split(" ")  [0]  )  ;

    // Step 2: Calculate the primary component, 'x'.
    // This is a direct multiplication of the input by 800.
    var   x   =   800   *   input  ;

    // Step 3: Calculate the secondary component, 'y'.
    // This involves integer division of the input by 15,
    // then multiplying the floor of that result by 200.
    var   y   =   200   *   Math  .  floor  (  input   /   15  )  ;

    // Step 4: Output the final calculated value.
    // The result is the difference between 'x' and 'y'.
    console  .  log  (  x   -   y  )  ;
}

// --- Program Execution Start ---
// This section handles reading input from the standard input stream.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin',
// which typically represents standard input in a Unix-like environment.
// The content is read as a 'utf8' encoded string and then passed to the Main function.
Main(  require("fs")  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;

/*
 * End of the script.
 * The Main function has been called with the processed input.
 */