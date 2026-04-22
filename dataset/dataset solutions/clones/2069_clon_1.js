/*
 * This file contains the main logic for processing input
 * and calculating a specific result based on two integer values.
 * It's a simple program designed to solve a particular problem.
 * Version: 1.0
 */

// Define the primary function that processes the input string.
function         Main       (   input   )       {

    // Parse the first integer value from the input string.
    // The input is trimmed, split by space, and the first part is taken.
    var M =          parseInt(input.trim().split(" ")[0]   ,    10      )       ;


    // Parse the second integer value from the input string.
    // Similar to the first, but taking the second part after splitting.
    var       H = parseInt(   input.trim().split(" ")[1]   ,   10   )   ;


    // Calculate the result based on the values of M and H.
    // If either M or H is 1, the result is 1.
    // Otherwise, it's the ceiling of (M * H) / 2.
    var result = (   M === 1 || H === 1   )   ?   1   :   Math.ceil(M*H/2)   ;

    // Output the calculated result to the console.
    console.log(   result   )   ;
}

// Call the Main function with the input read from standard input.
// This reads the entire file content from /dev/stdin as UTF-8.
Main(   require("fs").readFileSync("/dev/stdin","utf8")   )   ;
// End of program execution.