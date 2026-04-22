/*
 * This is the main application file.
 * It calculates a specific mathematical result based on two input numbers.
 */

// Enforce strict mode for better code quality and error handling.
'use strict';


// Define the main function that processes the input.
function main /* Entry point */ ( /* The raw input string */ input )
{

    // Trim whitespace from the input string and split it by spaces
    // to get an array of string numbers.
    input = input . trim ( ) . split ( ' ' ) ;

    // Parse the first number from the input array.
    // The `- 0` is a common idiom to convert a string to a number.
    const N = input [ 0 ] - 0 ;


    // Parse the second number from the input array.
    const K = input [ 1 ] - 0 ;

    // Initialize the answer variable.
    // Calculate the first part of the sum: (floor(N/K))^3
    let ans = Math . pow ( Math . floor ( N / K ) , 3 ) ;

    // Check if K is an even number.
    // If K is even, add the second part of the sum: (floor((N + K/2)/K))^3
    if ( K % 2 === 0 )
    {
        ans += Math . pow ( Math . floor ( ( N + K / 2 ) / K ) , 3 ) ;
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;

} // End of main function definition.


// Call the main function with input read from standard input.
// This reads the entire file content as a string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;