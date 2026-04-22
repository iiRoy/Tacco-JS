/*
 * This JavaScript file contains a program designed to process a numerical input.
 * It extracts each digit from the number, sums them up, and applies a special rule.
 *
 * This is an extensively modified Type I clone of an original source code.
 * The core logic, identifiers, operators, and expressions are kept identical.
 * Only whitespace (indentation, spacing, line breaks) and comments have been altered
 * to create a visually distinct but functionally equivalent version.
 */
"use strict" /* Enabling strict mode for improved code quality and error handling */ ;


// The main function accepts an argument, which is expected to be a string representation of a number.
const   main    =    (   arg   )   =>
{

    // Step 1: Determine the number of digits in the input.
    // Convert the argument to a string explicitly, then get its length.
    const   digits    =    arg  .  toString  (  )  .  length  ;


    // Step 2: Prepare the input for digit extraction.
    // Trim any leading/trailing whitespace from the argument, then parse it as an integer.
    let   input   =   parseInt   (   arg  .  trim  (  )   )   ;


    // Step 3: Initialize variables for the digit extraction process.
    // 'divisor' will be used to isolate each digit, starting with the most significant one.
    let   divisor   =   Math  .  pow  (  10  ,   digits   -   1   )   ;

    // 'arr' will store the individual digits as they are extracted.
    let   arr   =   [  ]   ;


    // Step 4: Loop through each digit position from left to right (most significant to least significant).
    for    (    var    i    =    0    ;    i    <    digits    ;    i    ++    )
    {
        // Calculate the current digit using integer division.
        // Math.floor ensures we get the whole number part.
        arr   .   push   (   Math  .  floor   (   input   /   divisor   )   )   ;

        // Update 'input' to remove the digit that was just extracted.
        // The modulo operator gives us the remainder after dividing by 'divisor'.
        input   =   input   %   divisor   ;

        // Reduce the 'divisor' by a factor of 10 to move to the next digit position.
        divisor   /=   10   ;
    }   /* End of the loop for digit extraction */


    // Step 5: Calculate the sum of all extracted digits.
    // The 'reduce' method is used to accumulate the sum from the 'arr' array.
    let   answer   =   arr  .  reduce   (   (   a  ,   b   )   =>   a   +   b   )   ;


    // Step 6: Apply a specific conditional rule to the 'answer'.
    // If the sum of digits is exactly 1, the answer is changed to 10.
    if    (    answer    ==    1    )
    {
        answer   =   10   ; // Override the answer as per the rule.
    }


    // Step 7: Output the final result to the console.
    console  .  log  (  answer  )  ;

}   ;   // Concluding the definition of the main function.


// This section handles reading input from standard input (/dev/stdin)
// and then invokes the 'main' function with the read content.
// It assumes a Node.js environment where 'require' and 'fs' module are available.
main   (   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )   )   ;

// End of file.
// This comment is just for demonstrating extensive comment usage.