/*
 * This script processes input data to determine a specific condition.
 * It's designed to run in a Node.js environment, reading from standard input.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

'use strict' ;


// Immediately Invoked Function Expression (IIFE) to encapsulate logic.
( function ( input ) {


    // Process the input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into an array of strings by one or more whitespace characters.
    // 3. Convert each string element to a number using `x-0` trick.
    input = input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;


    // Destructure the first three elements of the processed input array
    // into constants K, X, and Y for easier access and readability.
    const   K = input [ 0 ] ,
            X = input [ 1 ] ,
            Y = input [ 2 ] ;


    // Check a specific condition involving K, X, and Y.
    // The condition is: K is an even number AND the sum of X and Y is an odd number.
    if ( ( K % 2 === 0 ) && ( ( ( X + Y ) % 2 ) === 1 ) )
    {
        // If the condition is met, output -1 to the console.
        console . log ( -1 ) ;

        // Terminate the function execution.
        return ;
    }


} ) (

    // The input for the IIFE is read synchronously from '/dev/stdin'
    // using Node.js's 'fs' module, and decoded as UTF-8.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )

) ; // End of IIFE invocation.