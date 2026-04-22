/*
 * This JavaScript code is a Type I clone of an original source.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered to present
 * a visually distinct, yet functionally identical, artifact.
 */

function Main ( input )
{

    // The input string is first split into an array of individual characters.
    input = input . split ( "" ) ;

    // Initialize the primary accumulator variable for the final result.
    var sum = 0 ;

    // Initialize two counters, 'g' and 'p', for game-like logic.
    var g   = 0 ;
    var p   = 0 ;

    // Iterate over each character ('val') in the processed input array.
    input . forEach ( function ( val )
    {
        // A switch statement handles the logic based on the current character.
        switch ( val )
        {
            // Case for when the character encountered is 'g'.
            case "g" :
                // If 'p' counter is less than 'g' counter,
                if ( p < g )
                {
                    sum ++ ; // Increment the sum.
                    p   ++ ; // Increment the 'p' counter.
                }
                else // Otherwise (if 'p' is not less than 'g'),
                {
                    g ++ ; // Increment the 'g' counter.
                }
                break ; // Exit the switch statement for this case.

            // Case for when the character encountered is 'p'.
            case "p" :
                // If 'p' counter is less than 'g' counter,
                if ( p < g )
                {
                    p ++ ; // Simply increment the 'p' counter.
                }
                else // Otherwise (if 'p' is not less than 'g'),
                {
                    g   ++ ; // Increment the 'g' counter.
                    sum -- ; // Decrement the sum.
                }
                break ; // Exit the switch statement for this case.
        } // End of the switch block.

    } ) ; // End of the forEach method call.

    // Finally, print the accumulated sum to the console.
    console . log ( sum ) ;

} // End of the Main function definition.


// The Main function is immediately invoked with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;