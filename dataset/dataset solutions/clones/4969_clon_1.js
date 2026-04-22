/*
 *  This file contains the main logic for processing a sequence of characters.
 *  It simulates a state machine where the next state is determined by the
 *  current character and the available character arrays.
 *  Authored by an expert in code clone generation.
 */

 'use strict' ; // Enforce strict mode for better code quality and fewer silent errors.


 /**
  * The main function processes the input string.
  * @param {string} input - The raw input string, typically from stdin.
  */
const   main  =  (  input  )  =>   {

    // Split the input string by newlines and then each line into an array of characters.
    // This effectively creates a 2D array of characters.
    input  =  input . split ( '\n' ) . map ( v  =>  v . split ( '' ) ) ;

    // Assign the first three lines of input to variables 'a', 'b', and 'c'.
    // These arrays represent the character sequences for each state.
    const   a   =   input [ 0 ] ;
    const   b   =   input [ 1 ] ;
    const   c   =   input [ 2 ] ;


    // Initialize the current state indicator.
    // 'i' will store the character representing the next array to pick from.
    let   i   =   'a' ;

    // Initialize an empty array to hold the current item sequence.
    let   item   =   [ ] ;

    // Start an infinite loop that breaks when a sequence is exhausted.
    while ( true ) {

        // Determine which character array to use based on the current state 'i'.
        if ( i   ===   'a' ) {
            item   =   a ; // Use array 'a'
        } else   if ( i   ===   'b' ) {
            item   =   b ; // Use array 'b'
        } else {
            item   =   c ; // Use array 'c' (default if not 'a' or 'b')
        }


        // Check if the current character sequence is exhausted.
        if ( item . length   ===   0 ) {
            // If exhausted, print the current state in uppercase and terminate.
            console . log ( i . toUpperCase ( ) ) ;
            break ; // Exit the while loop.
        }

        // Get the next character from the current sequence and update the state.
        // `shift()` removes the first element from the array and returns it.
        i   =   item . shift ( ) ;

    } // End of while loop.

} ; // End of main function.


// Read input from standard input and pass it to the main function.
// This is a common pattern for competitive programming in Node.js.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf-8' ) ) ;