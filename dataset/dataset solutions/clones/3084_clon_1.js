/*
 * This file contains a JavaScript program that processes input
 * to determine a specific condition based on character counts.
 * It's a Type I clone, meaning its functionality is identical
 * to the original, but its presentation differs significantly
 * due to variations in whitespace and comments.
 *
 * Author: Code Clone Generator
 * Date: [Current Date]
 * Version: 1.0.0
 */

function   Main  (  input  )
{
    // Declare and initialize a constant to store command-line arguments,
    // splitting the input string by newline characters.
    const   args   =   input.split ( "\n" ) ;


    // Parse the first argument as an integer, representing the total number of items.
    const   num    =   parseInt ( args [ 0 ] ) ;


    // Calculate half of the total number, used as a threshold.
    const   half   =   num   /   2 ;


    // Retrieve the second argument, which is expected to be a string of characters.
    const   str    =   args [ 1 ] ;


    // Initialize a boolean variable to store the final result. Defaults to false.
    var     ret    =   false ;


    // Initialize a counter for 'R' characters.
    var     countR =   0 ;


    // Initialize a counter for 'B' characters.
    var     countB =   0 ;


    // Begin a loop that iterates through each character in the 'str' string.
    for   (   var   i   =   0 ;   i   <   num ;   i   ++   )
    {
        // Extract the current character at index 'i'.
        var   ch   =   str [ i ] ;

        // Check if the current character is 'R'.
        if   (   ch   ===   'R'   )
        {
            // If it's 'R', increment the 'countR' counter.
            countR   ++ ;

            // Check if the count of 'R' characters exceeds the 'half' threshold.
            if   (   countR   >   half   )
            {
                // If it does, set 'ret' to true and exit the loop early.
                ret   =   true ;
                break ;
            }
        }
        else
        {
            // If the character is not 'R' (assuming it's 'B' or another character that should be counted here),
            // increment the 'countB' counter.
            countB   ++ ;

            // Check if the count of 'B' characters is greater than or equal to the 'half' threshold.
            if   (   countB   >=   half   )
            {
                // If it is, set 'ret' to false and exit the loop early.
                ret   =   false ;
                break ;
            }
        }
    }


    // Output the final result to the console.
    // If 'ret' is true, print 'Yes'; otherwise, print 'No'.
    console.log ( ret   ?   'Yes'   :   'No' ) ;
}


// Invoke the Main function with input read from standard input.
// This assumes an environment where 'require("fs")' is available (e.g., Node.js).
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;