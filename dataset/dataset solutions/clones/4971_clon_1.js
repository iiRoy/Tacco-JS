/*
 * This is a Type I clone generated from an original JavaScript code snippet.
 * It maintains exact logical and structural identity while extensively
 * varying whitespace and comments to create a visually distinct representation.
 */

'use strict' /* Enforce strict mode for better code quality. */

// Define the main function that processes the input.
function Main ( input )
{

        /* Split the input string by newline characters
         * to get an array of lines.
         */
    const   inputArray  =  input . split ( '\n' ) ;

    // Initialize an object to store arrays for 'a', 'b', and 'c'.
    const obj = {
            // Property 'a': spread characters from the first input line.
            a : [ ... inputArray [ 0 ] ] ,

            // Property 'b': spread characters from the second input line.
            b : [ ... inputArray [ 1 ] ] ,

            // Property 'c': spread characters from the third input line.
            c : [ ... inputArray [ 2 ] ]
    } ;


    let thisTime =  'a' ; // Initialize the current turn with 'a'.
    let nextTime =  '' ; // Placeholder for the next turn.
    let result   =  '' ; // Variable to store the final result.

    /*
     * Start an infinite loop to simulate the game turns.
     * The loop will be explicitly broken when a condition is met.
     */
    while ( 1 )
    {
            // Get the next character from the current player's array and remove it.
            // Note: 'nextTurn' is an undefined variable in the original code,
            // which implies a potential runtime error or specific external context.
            // This behavior is preserved as per Type I cloning rules.
            nextTime    =   obj [ nextTurn ] . shift ( ) ;

            // Check if the current player's array is empty.
            if  ( obj [ thisTime ] . length  ==  0 )
            {
                // If empty, set the result to the current player's uppercase name.
                result  =   thisTime . toUpperCase ( ) ;
                break   ; // Exit the loop as the game has ended.
            }

            // Update the current player to the next player.
            thisTime    =   nextTime ;
    }

    // Output the final result to the console.
    console . log ( result ) ;
}

/*
 * Call the Main function with input read from standard input.
 * This reads the entire content of '/dev/stdin' as a UTF-8 string.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;