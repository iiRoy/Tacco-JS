/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * Extensive modifications to whitespace and comments have been made
 * to ensure a visually distinct appearance.
 */


function   Main   (   input   )
{

    /*
     * Declare and initialize variables needed for processing.
     * The input string will be split into an array.
     */
    var   inputArr   =   input.split  (  ' '  )   ;


    var   sNum   =   Number  (  inputArr  [  0  ]  )   ;


    var   cNum   =   Number  (  inputArr  [  1  ]  )   ;


    var   result   =   0   ;   // Initialize the counter for valid combinations.


    // Section 1: Handle combinations involving 'S' units.
    // This loop processes pairs of 'c' units with one 's' unit.
    while   (   sNum   >=   1   &&   cNum   >=   2   )
    {
        sNum   -=   1   ;    // Decrement 's' count.

        cNum   -=   2   ;    // Decrement 'c' count by two.

        result   +=   1   ;   // Increment the total result.
    }


    /*
     * Section 2: Handle remaining 'c' units.
     * After exhausting 's' units or 'c' units for 's'-involved combinations,
     * this loop checks for combinations using only 'c' units.
     * Each combination requires four 'c' units.
     */
    while   (   cNum   >=   4   )
    {

        cNum   -=   4   ;    // Consume four 'c' units.

        result   +=   1   ;   // Another combination found.
    }


    // Output the final calculated result to the console.
    console.log   (   result   )   ;
}


// Example call (commented out in the original, keeping it that way).
// Main("12345 678901");


/*
 * The primary entry point for execution in a typical environment.
 * Reads input from standard input and passes it to the Main function.
 */
Main   (   require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )   )   ;