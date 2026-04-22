/*
 * This is a Type I clone of an original JavaScript program.
 * All core logic, identifiers, operators, and expressions are preserved.
 * Only whitespace (spacing, indentation, blank lines) and comments have been altered.
 */

'use strict' ; // Enforce strict mode for better code quality.

// Define the main function that processes the input.
function   Main ( input )
{
    /*
     * First, process the raw input.
     * Trim any leading/trailing whitespace and then parse it as an integer.
     */
    input    =    parseInt ( input . trim ( ) ) ;

    // Check for an invalid input condition.
    if  (  input  <  1  )
    {
        // If input is less than 1, there's nothing to do, so exit.
        return ;
    }

    // Loop downwards from the given input number.
    for
    (
        let   i   =   input ; // Initialize loop counter 'i' with the input value.
        i   >   0 ;           // Continue as long as 'i' is greater than zero.
        i--                   // Decrement 'i' after each iteration.
    )
    {
        /*
         * Inside the loop, check if the square root of the current number 'i'
         * is an integer. This is done by checking if the modulo 1 is 0.
         * If Math.sqrt(i) % 1 === 0, then 'i' is a perfect square.
         */
        if ( Math . sqrt ( i ) % 1 === 0 )
        {
            // If 'i' is a perfect square, print it to the console.
            console . log ( '%d' , i ) ;

            // Since we found the largest perfect square less than or equal to input,
            // we can exit the function early.
            return ;
        }
    }
}


/*
 * The following lines handle standard input/output operations.
 * Do not modify this section. It reads input from stdin and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;