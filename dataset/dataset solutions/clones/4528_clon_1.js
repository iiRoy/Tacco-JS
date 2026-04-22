/*
 * This is a JavaScript file demonstrating a Type I code clone.
 * Strict mode is enabled for this entire script.
 */
'use strict';



function   main  (   input   )   {
        // The main function processes the given input.

    input   =   input.split(  /\n/  )  ; // Split the input string by newline characters into an array.

    const   n   =   ~~input[0]  ; // Convert the first element to an integer using bitwise NOT operator.

    // The following block processes the second line of input.
    // It involves splitting by space, converting to numbers,
    // removing duplicates, and then sorting the resulting array.
    let   houses   =   input[1] // Access the second line of the input.
        .split(  ' '  ) // Split the string by spaces to get an array of number strings.
        .map(  v   =>   ~~v  ) // Convert each string element to an integer.
        .filter(  (  v,   i,   self  )   =>   { // Filter out duplicate values.
            return   self.indexOf(  v  )   ===   i  ; // Keep only the first occurrence of each value.
        }  ) // End of filter method.
        .sort(  (  a,   b  )   =>   a   -   b  )  ; // Sort the unique numbers in ascending order.


    // Calculate the difference between the largest and smallest house numbers.
    const   ans   =   houses[houses.length   -   1]   -   houses[0]  ;

    console.log(  ans  )  ; // Output the final answer to the console.


} // End of the main function definition.


// This line reads the input from standard input and passes it to the main function.
main(  require(  'fs'  )  .readFileSync(  '/dev/stdin'  ,   'utf8'  )  )  ;