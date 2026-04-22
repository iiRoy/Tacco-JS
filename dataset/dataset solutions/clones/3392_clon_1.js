/*
 * This is a JavaScript file demonstrating
 * a specific string processing algorithm.
 * It's a Type I clone, focusing on whitespace and comments.
 * The core logic remains entirely unchanged.
 */

"use strict" ; // Enforce strict mode for better error handling and cleaner code.


// Define the main function that processes the input.
function   main(  input  ) {

    // Split the entire input string by newline characters.
    // Then, filter out any resulting empty strings to ensure valid lines.
    const inputs   =   input . split ( "\n" ) . filter (   x   =>   x   !==   ""   ) ;

    // The problem logic indicates we are interested in the first line of input.
    const   s   =   inputs[   0   ] ;

    // This section calculates the final result by chaining several array methods.
    const   result   =   s
        . split (   ""   ) // Step 1: Convert the input string 's' into an array of individual characters.
        . map (   (   char  ,   idx   )   =>   (   char   ===   "W"   ?   idx   :   0   )   ) // Step 2: Map each character. If it's 'W', replace it with its original index; otherwise, replace with 0.
        . filter (   val   =>   val   !==   0   ) // Step 3: Filter out all the zeros, retaining only the original indices of 'W' characters.
        . reduce (   (   accumulator  ,   currentValue  ,   currentIndex   )   =>   accumulator   +   currentValue   -   currentIndex   ) ; // Step 4: Reduce the array of indices. The formula is `sum_of_indices_of_W - sum_of_their_positions_in_the_filtered_array`.

    // Output the final computed result to the standard console.
    console . log (   result   ) ;

} // End of the main function definition.


// Immediately invoke the main function upon script execution.
// It reads the entire content of standard input synchronously,
// assuming it's UTF-8 encoded.
main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"  ,   "utf8"   )   ) ;