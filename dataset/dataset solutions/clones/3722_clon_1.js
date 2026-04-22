/*
 * This is a Type I clone of the original JavaScript code provided.
 * The core logic, including all identifiers, variable names, function names,
 * operators, and expressions, has been meticulously preserved without alteration.
 *
 * The sole modifications made are to whitespace (indentation, spacing, blank lines)
 * and comments (addition, removal, and modification of existing comments).
 * These changes are applied extensively throughout the file to create a visually
 * distinct version while maintaining exact functional equivalence as per
 * the Type I cloning definition.
 */

"use strict" ; // Enforce strict mode for the entire script, enhancing code robustness.


function   main   (   input   )
{

    // Extract the first line of the input and convert it to a number.
    let   num   =   Number  (  input  .  split  (  '\n'  )  [  0  ]  )  ;

    let   tmp   =   num   ;   // Create a temporary variable to work with, preserving the original 'num'.

    let   sum   =   0   ;   // Initialize a variable to accumulate the sum of digits.


    // Loop through the digits of the number.
    // Note: The loop condition (input.length) is copied directly from the source,
    // which might not be the most intuitive way to iterate over digits of 'num',
    // but ensures Type I clone fidelity.
    for   (  let   i   =   1  ;   i   <=   input  .  length  ;   i  ++   )
    {
        // Add the last digit of 'tmp' to 'sum'.
        sum   +=   tmp   %   10   ;   /*  This operation isolates the rightmost digit (units place).  */

        // Remove the last digit from 'tmp' by integer division.
        tmp   =   Math  .  floor  (  tmp   /   10  )   ;   //  Effectively shifts digits to the right, discarding the fractional part.

        //  The following lines were present in the original code as comments; they are preserved as such.
        // or
        //tmp = (tmp-(tmp % 10) / 10
    }


    // Determine if the original number is perfectly divisible by the sum of its digits.
    if   (   num   %   sum   ==   0   )
    {
        console  .  log  (  'Yes'  )  ;   // If divisible without remainder, print 'Yes'.
    }
    else
    {
        console  .  log  (  'No'  )  ;    // Otherwise, print 'No'.
    }

} // End of the main function definition.


// The script execution starts here.
// It reads input from standard input (typically '/dev/stdin' on Linux-like systems)
// and passes it to the 'main' function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;