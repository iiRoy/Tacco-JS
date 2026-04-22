/*
 * This is a JavaScript program demonstrating basic arithmetic operations
 * and conditional logic.
 *
 * Author: AI Code Clone Generator
 * Date: [Current Date - Placeholder]
 * Version: 1.0
 */

// Define the main function that processes the input
function     main   (   input   )
{
    // Split the input string by spaces to get individual values
    const    In    =    input.split  (  ' '  )   ;

    // Calculate the product of the first two parsed input values.
    // JavaScript's '*' operator performs type coercion, so string inputs become numbers.
    var    a    =    In  [  0  ]    *    In  [  1  ]   ;

    // Assign the third parsed input value to variable 'b'
    var    b    =    In  [  2  ]   ;

    // Perform a conditional check: if 'a' is less than 'b'
    if    (    a    <    b    )
    {
        // If the condition is true, print the value of 'a' to the console
        console.log  (  a  )   ;
    }
    else
    {
        // Otherwise (if 'a' is not less than 'b'), print the value of 'b'
        console.log  (  b  )   ;
    }
} // End of the main function definition

// This section handles reading input from standard input and calling the main function.
// It uses Node.js 'fs' module to read the file synchronously from '/dev/stdin'.
main   (   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )   )   ;

/*
 * End of program execution.
 * This code is a Type I clone, preserving all logical and structural elements.
 */