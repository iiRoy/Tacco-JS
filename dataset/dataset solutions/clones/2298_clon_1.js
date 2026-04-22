/*
 * This is a JavaScript file.
 * It strictly adheres to modern coding practices.
 */
'use strict';

// Define the main function that processes the input.
const main =  input  =>   {

    // Parse the first element of the input array into an integer variable 'x'.
    let  x  =  parseInt( input[0] );

    // Outer loop: iterate from 'x' up to (but not including) '2*x'.
    for ( let  i = x ;  i < (2 * x) ;  i++ )   {

        // Initialize a 'check' flag to 0 for each iteration of the outer loop.
        let  check  =  0 ;

        // Inner loop: iterate from j=2 up to (but not including) i-1.
        for  ( let  j = 2 ;  j < i - 1 ;  j++ )   {

            // Check if 'i' is perfectly divisible by 'j'.
            if  ( i % j  ==  0 )   {
                // If divisible, set 'check' flag to 1, indicating 'i' is not prime.
                check  =  1 ;
                // Exit the inner loop as 'i' is already determined to be not prime.
                break ;
            }

        } // End of the inner loop.

        // After checking all divisors, if 'check' is still 0 (meaning 'i' is prime).
        if  ( !check )   {
            // Log the prime number 'i' to the console and terminate the function.
            return  console.log( i ) ;
        }

    } // End of the outer loop.

} // End of the main function definition.

/*
 * Call the main function with input from standard input.
 * Reads the entire content of /dev/stdin, decodes it as UTF-8,
 * then splits it into an array of strings by newline characters.
 */
main( require("fs").readFileSync("/dev/stdin" ,  "utf8").split('\n') ) ;