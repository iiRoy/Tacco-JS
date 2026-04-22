/*
 * This JavaScript code processes numerical input from standard input.
 * It applies a conditional calculation based on the first number provided.
 *
 * This file adheres to strict mode for improved code quality and error detection.
 */

"use strict" ; // Enforces strict parsing and error handling rules.

/**
 * The primary function that orchestrates the program's logic.
 * It takes a string 'input' (typically from standard input) and processes it.
 *
 * @param   {string}   input   The raw string input from the environment.
 */
function   Main  (  input  )   {

    // Step 1: Pre-process the raw input string into an array of numbers.
    //   - .trim(): Removes any leading or trailing whitespace from the string.
    //   - .split(' '): Divides the string into an array of substrings,
    //                  using a single space as the delimiter.
    //   - .map(Number): Iterates over the array of substrings and converts each
    //                   substring into its numerical representation.
    input   =   input.trim().split(' ').map(Number) ;


    // Step 2: Apply conditional logic based on the value of the first number.

    // Check if the first element of the processed input array is less than or equal to 10.
    if  (  input[0]   <=   10  )
    {
        // If the condition is true, perform a specific calculation.
        // The calculation adds a penalty (100 times the difference from 10)
        // to the second input number.
        console.log(  input[1]   +   (  100   *   (  10   -   input[0]  )  )  ) ;
    }
    // If the first element is NOT less than or equal to 10 (i.e., it's greater than 10).
    else
    {
        // In this case, simply output the second input number without any modification.
        console.log(  input[1]  ) ;
    }

} // End of the Main function definition.


// Step 3: Execute the Main function with input obtained from standard input.
//   - require("fs"): Imports Node.js's built-in File System module.
//   - .readFileSync("/dev/stdin", "utf8"): Reads the entire content of the
//     standard input file synchronously, interpreting it as UTF-8 encoded text.
//     This content is then passed as the 'input' argument to the Main function.
Main  (  require("fs").readFileSync("/dev/stdin", "utf8")  ) ;