/*
 * This JavaScript file processes input from standard input.
 * It calculates the division of two numbers provided as a space-separated string.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain strictly identical.
 */

// Define the main function that encapsulates the logic.
// It accepts a single parameter, 'input', which is expected to be a string.
function     main(  input   )     { // Start of the main function's code block.

    // Split the input string by a space character.
    // This creates an array where each element is a part of the original string.
    const inputs   =    input .  split   (   ' '   )  ;


    /*
     * The first element of the 'inputs' array is assigned to constant 'T'.
     * 'T' typically represents the numerator or total value in this context.
     */
    const   T    =    inputs  [  0  ]   ;


    // The second element of the 'inputs' array is assigned to constant 'X'.
    // 'X' typically represents the denominator or divisor.
    const X  = inputs [  1  ]   ;


    // Perform the division of T by X and print the result to the console.
    // JavaScript's division operator automatically handles type coercion for numbers.
    console .  log( T  /  X );

} // End of the main function definition.


// Immediately invoke the main function.
// The input for the main function is read asynchronously from standard input.
// 'require('fs')' is used to access the file system module in Node.js.
// 'readFileSync' reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
main(  require ( 'fs' ) .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  ) ;