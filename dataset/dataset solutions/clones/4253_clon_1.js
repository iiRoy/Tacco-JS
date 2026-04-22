/*
 * This file contains the main logic for processing a numerical input.
 * It searches for the largest perfect square less than or equal to the input number.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


function Main ( input )
{
    // Declare a variable to store the parsed integer value of the input.
    var    num    =    parseInt ( input )   ;


    // Loop downwards from the given number to find the largest perfect square.
    // The loop continues as long as the current number 'i' is greater than 1.
    // The value of 'i' is decremented by 1 in each iteration.
    for  (  var  i  =  num  ;  i  >  1  ;  i--  )
    {
        // Check if the square root of 'i' is an integer.
        // A number is a perfect square if its square root modulo 1 is exactly 0.
        if  (  Math.sqrt ( i )  %  1  ===  0  )
        {
            // If 'i' is a perfect square, print it to the console.
            console.log( i ) ;

            // Since we are looking for the largest perfect square,
            // the first one found (looping downwards) is the answer.
            break ;
        }
    } // End of for loop
} // End of Main function


// Call the Main function with input read from standard input.
// The 'fs' module is used to read the file, and 'readFileSync' reads it synchronously.
// The path '/dev/stdin' is a common convention for standard input in some environments.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;