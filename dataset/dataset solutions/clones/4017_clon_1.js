/*
 * This is a JavaScript file.
 * It strictly adheres to modern JavaScript conventions.
 * The purpose of this script is to perform a specific calculation based on a single-line numeric input.
 */
"use strict" ; // Enforce strict mode for better error handling and cleaner code.


// Define the main function that serves as the entry point for processing the input.
const main = (  input  )  =>    {


    // Split the input string by newline characters.
    // This assumes the input is a single line for the primary logic,
    // but `split` always returns an array.
    const  lines  =  input.split ( "\n" ) ;

    // Check a specific condition related to the length of the first line of input.
    // If the first line has only one character, a special case is handled.
    if  (  lines [  0  ] . length  ===  1  )  {

        // For a single-digit input, the output is always '9'.
        // This is a specific rule or edge case for the problem.
        console.log  (  '9'  ) ;


        // Terminate the execution of the main function early as the result is determined.
        return ;

    } // End of the conditional block for single-character input.


    // Calculate a variable representing the length of the input string minus one.
    // This value often corresponds to the number of trailing digits or a multiplier.
    const  len9  =  lines [  0  ] . length  -  1  ;


    // Extract the first character of the input string, convert it to an integer,
    // and then subtract one from the result. This typically gets the leading digit's value minus one.
    const  head  =  parseInt (  lines [  0  ] [  0  ]  )  -  1  ;


    // Compute the final result using the previously calculated 'head' and 'len9' values.
    // The formula appears to be (first_digit - 1) + (number_of_remaining_digits * 9).
    console.log  (  head  +  len9  *  9  ) ;


} ; // End of the main function definition.


// The script execution starts here.
// It reads the entire content from standard input (typically '/dev/stdin' on Linux-like systems)
// using Node.js's file system module and UTF-8 encoding.
// The read content is then passed as an argument to the 'main' function.
main  (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )  ) ; // Execute the main logic.