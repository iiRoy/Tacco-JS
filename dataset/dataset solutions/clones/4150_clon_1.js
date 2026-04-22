/*
 * This JavaScript file processes numerical input from standard input.
 * It calculates the ceiling of the average of the provided numbers.
 *
 * Purpose: Illustrate basic input processing and arithmetic operations.
 * Author: AI Code Generation Service
 * Version: 1.0
 */


function   Main   (   input   )
{

    // Step 1: Split the incoming 'input' string into an array of individual number strings.
    // The regular expression /\s/ matches any whitespace character (space, tab, newline, etc.).
    const   inputNumbers   =   input .   split   (   /\s/   )   ;


    /*
     * Step 2: Initialize a variable 'sum' to accumulate the total value of all numbers.
     * It's crucial to start 'sum' at zero to ensure correct aggregation.
     */
    var   sum   =   0   ;


    // Step 3: Iterate over each element in the 'inputNumbers' array.
    // For each element, convert it to an integer and add it to the running 'sum'.
    inputNumbers .   forEach   (   (   num   )   =>
    {

        // Convert the current number string ('num') into an integer using parseInt().
        // Then, add this integer value to the 'sum' variable.
        sum   +=   parseInt   (   num   )   ;

    }   )   ;


    // Step 4: Calculate the average of the numbers and then find its ceiling.
    // The average is 'sum' divided by the count of numbers ('inputNumbers.length').
    // Math.ceil() rounds the result up to the nearest whole integer.
    console .   log   (   Math .   ceil   (   sum   /   inputNumbers .   length   )   )   ;

}


// This is the primary execution line of the script.
// It reads the entire content from the standard input stream (/dev/stdin) as a UTF-8 string.
// The read content is then passed as an argument to the 'Main' function for processing.
Main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript program.
// Any further code or comments beyond this point will not affect execution.