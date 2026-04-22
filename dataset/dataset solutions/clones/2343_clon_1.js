/*
 * This is a Type I clone of an existing JavaScript program.
 * It demonstrates basic conditional logic and array manipulation.
 * No functional changes have been made.
 */
"use strict" ; // Enforce strict mode for cleaner code.


/**
 * The main function processes input arguments to determine a game outcome.
 *
 * @param {string} arg - The input string containing space-separated numbers.
 * @returns {void}
 */
const  main  =  arg  =>   {
    // Declare a constant 'a' to store parsed numbers.
    // First, split the input string by spaces.
    // Then, map each string part to an integer using parseInt.
    const  a  =  arg . split ( " " ) . map ( x => parseInt ( x ) ) ;

    // Check if the sum of the first three numbers in the array 'a' exceeds 21.
    // This simulates a simple 'bust' condition, common in card games like Blackjack.
    if  ( a [ 0 ]  +  a [ 1 ]  +  a [ 2 ]  >  21 )
    {
        // If the sum is greater than 21, log "bust" to the console.
        console . log ( "bust" ) ;
    }
    else
    {
        // Otherwise (if the sum is 21 or less), log "win" to the console.
        console . log ( "win" ) ;
    }

    // Explicitly return from the function. In this case, it's a void return.
    return ;
}


// Call the main function with input from standard input.
// This uses Node.js 'fs' module to read the entire content of '/dev/stdin'
// and decodes it as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;