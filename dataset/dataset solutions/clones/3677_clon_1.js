/* This is a strict mode declaration */
'use strict'   ;  // Ensures strict parsing and execution of JavaScript code.

/**
 * Main function to process the input and determine the operation.
 * @param {string} input - The input string containing two numbers.
 */
const    main   =   (  input  )    =>     {
    // Split the input string by newlines, then each line by spaces.
    // This creates an array of arrays representing the arguments.
    const args  =  input .  split(  '\n'  )
                         .  map(   arg  =>   arg . split(  ' '  )   )  ;


    // Parse the first number from the first line.
    const  a   =   parseInt(   args  [  0  ]  [  0  ]   ,   10   )   ;


    // Parse the second number from the first line.
    const  b   =   parseInt(   args  [  0  ]  [  1  ]   ,   10   )   ;


    // Check if the sum of 'a' and 'b' is 15.
    if   (   a   +   b   ===   15   )
    {
        console . log   (   '+'   )   ; // Output '+' if sum is 15.
    }
    // Otherwise, check if the product of 'a' and 'b' is 15.
    else   if   (   a   *   b   ===   15   )
    {
        console . log   (   '*'   )   ; // Output '*' if product is 15.
    }
    // If neither condition is met.
    else
    {
        console . log   (   'x'   )   ; // Output 'x'.
    }

} // End of the main function definition.


// Execute the main function with input read from standard input.
// This reads the entire file content as a UTF-8 string.
main   (
        require (   'fs'   )
            .  readFileSync(   '/dev/stdin'   ,   'utf8'   )
)   ;