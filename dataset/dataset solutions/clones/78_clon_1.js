/*
 * This is a JavaScript file that defines a recursive factorial function
 * and subsequently utilizes it to compute the factorial of a numerical
 * input, which is read from the standard input stream.
 *
 * This implementation strictly adheres to the mathematical definition
 * of the factorial for non-negative integers.
 */


function   fact  ( x )
{
    // The base case for the factorial function:
    // The factorial of zero (0!) is defined as 1.
    if  ( x  ==  0 )
    {
        // Return the base case value immediately.
        return   1 ;
    }

    // The recursive step:
    // For any positive integer n, n! = n * (n-1)!
    return   x   *   fact  ( x  -  1 ) ;
}


// --- Program Entry Point ---

/**
 *  This section handles the input reading.
 *  The 'fs' (file system) module is required to read data synchronously.
 *  '/dev/stdin' is a common Unix-like path representing standard input.
 *  The input is assumed to be encoded in UTF-8 format.
 *  The result of this read operation is stored in the 'input' variable.
 */
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


// Finally, the program calculates the factorial of the received input
// by calling the 'fact' function and prints the result to the console.
console . log ( fact ( input ) ) ;