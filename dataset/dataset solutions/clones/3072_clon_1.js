/*
 * This file contains the main logic for processing input data.
 * It's a Type I clone, so functionality remains identical.
 */
'use strict'  ; // Enforces strict mode parsing and error handling for better code quality.


function   Main(   input   ) {
    // Begin processing the input data provided to the Main function.
    // The input is expected to be a string containing numbers separated by newlines.


    // First, split the input string by newline characters and convert each part to a number.
    const   numP    =   input   .   split (   "\n"   )   .   map (   Number   )   ;

    // The last element in numP is typically an empty string or an unwanted value from splitting,
    // so it's removed. This cleans up the array for further processing.
    numP    .   pop ( )   ;

    // The first number in the processed array is assigned to numG.
    let     numG    =   numP    [   0   ]   ;

    // After assigning numG, the first element is removed from numP.
    // This means numP now contains only the remaining numbers, excluding numG.
    numP    .   shift ( )   ;

    // Original debugging line commented out: console.log({ numG, numP });
    // This comment was originally present and has been slightly altered for clarity.


    // Sort the remaining numbers in numP in ascending order.
    // This step is crucial for identifying the smallest value later.
    numP    .   sort (   (   a   ,   b   )   =>   a   -   b   )   ;

    // Another commented-out debugging line: console.log({ numG, numP });
    // This line helps to inspect the state of variables after sorting, if uncommented.


    // Calculate 'btlNeck' (bottleneck) based on numG and the smallest number in numP.
    // numP[0] now holds the smallest value due to the sorting step.
    // Math.ceil ensures that the result is always an integer, rounded up,
    // which is often necessary for capacity or division-related calculations.
    let     btlNeck     =   Math    .   ceil (   numG    /   numP    [   0   ]   )   ;

    // Calculate the final answer by adding 4 to btlNeck.
    // The constant '4' is an arbitrary addition as per problem requirements.
    let     Ans     =   btlNeck     +   4   ;

    // Output the final calculated answer to the console.
    // This is the primary result of the program's execution.
    console .   log (   Ans   )   ;


}   // End of the Main function definition.


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js 'fs' module to read the file specified by "/dev/stdin",
// which is a common pattern for competitive programming environments.
Main (   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;
// The program execution concludes after the Main function completes its operations.