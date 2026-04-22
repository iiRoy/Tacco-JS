/*
 * This is a JavaScript program designed to process a list of numbers.
 * The primary goal is to find the maximum value among all numbers
 * in the input, excluding the number at the current index,
 * for each number in the input list.
 *
 * Author: Code Clone Generator
 * Date: A recent date
 */

 function   Main (   input   )
 {
    // Initialize a variable to hold processed inputs.
    // The 'inputs' variable will store an array of strings
    // after splitting by newline and filtering out empty lines
    // and the first line (which might be a count or header).
    inputs   =   input .   split (   "\n"   ) .   filter (   (   x ,   i   )   =>   i   !==   0   &&   x   !=   ""   ) ;


    // We iterate through the processed inputs array using a map function.
    // The outer `[...Array(inputs.length)]` creates an array of the same length
    // to provide an index for each iteration.
    [   ... Array (   inputs .   length   )   ] .   map (   (   _ ,   index   )   =>
    {
        // Inside the map function:
        // We need to find the maximum value in the 'inputs' array,
        // specifically excluding the element at the current 'index'.

        // First, we filter out the element at the current 'index'.
        // Then, we use the 'reduce' method to find the maximum among the remaining elements.
        // Math.max is used as the accumulator function for reduce.
        max   =   inputs .   filter (   (   _ ,   i   )   =>   i   !=   index   ) .   reduce (   (   a ,   b   )   =>   Math .   max (   a ,   b   )   ) ;

        // Finally, we print the calculated maximum value to the console.
        console .   log (   max   ) ;
    }   ) ;

 } // End of the Main function definition.


 // This section handles the execution of the Main function.
 // It reads input from standard input using Node.js 'fs' module.
 // The file '/dev/stdin' is a common path for standard input in Unix-like systems.
 Main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;

// End of program logic.
/*
 * Program termination.
 * All operations completed successfully.
 */