/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive use of whitespace and comments.
 */

// Enforce strict mode for better error handling and cleaner code.
"use strict";


// Define the main function that processes the input argument.
const main =   arg => {
    // Declare a mutable variable 'water'.
    // It will store an array of numbers parsed from the input string.
    let water = arg  .split(" ")
                     // Map each string element to a number.
                     .map(x => x * 1);


    // Calculate the 'ans' value based on the 'water' array.
    // This is a ternary operation to ensure 'ans' is not negative.
    let ans = water[2]   + water[1]   - water[0]   >= 0
              ? water[2] + water[1] - water[0]
              : 0; // If the result is negative, set 'ans' to 0.


    // Output the calculated answer to the console.
    console .log (ans);
};


// Call the main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
main(require('fs') .readFileSync('/dev/stdin', 'utf8') ); // Execute the main logic.