/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 *
 * The only modifications are extensive changes to whitespace and comments
 * to alter the visual appearance without affecting the logical or structural
 * integrity of the program.
 */

// Define the main function that processes the input
function Main ( input )
{
    // The input string is split into an array of characters, representing tiles.
    // This creates an array where each element is a single character from the input.
    tile = input.split ( '' ) ;

    /*
     * Initialize a counter for the number of necessary changes.
     * This variable will track how many times a 'change' operation is simulated.
     */
    changeCount = 0 ;

    // Initialize a flag to track if a change operation is currently "active" or "in progress".
    // 'false' indicates no active change, 'true' indicates a change is ongoing.
    changeFlag = false ;


    // Begin iterating through the 'tile' array, starting from the second element (index 1).
    // The loop compares each tile with its preceding tile.
    for ( var index = 1 ; index < tile.length ; index++ )
    {

        /*
         * First condition:
         * If the current tile is the same as the previous tile,
         * AND there is no active change operation (changeFlag is false).
         * This scenario means we've found a sequence of identical tiles
         * and need to initiate a 'change'.
         */
        if ( tile [ index ] == tile [ index - 1 ] && ! changeFlag )
        {
            // Set the changeFlag to true, indicating a change operation has started.
            changeFlag = true ;

            // Increment the changeCount, as a new change operation is initiated here.
            changeCount ++ ;
        }
        /*
         * Second condition:
         * If the current tile is different from the previous tile,
         * AND there IS an active change operation (changeFlag is true).
         * This means the sequence of identical tiles has ended,
         * but the change operation, once started, must continue for this different tile.
         */
        else if ( tile [ index ] != tile [ index - 1 ] && changeFlag )
        {
            // Increment the changeCount. The ongoing change operation affects this tile too.
            changeCount ++ ;
        }
        // Else block: This covers all other cases not met by the above conditions.
        // Specifically, it handles:
        // 1. Current tile != previous tile AND changeFlag is false (no change needed or started).
        // 2. Current tile == previous tile AND changeFlag is true (change already active for this sequence, no new change needed).
        else
        {
            // Reset the changeFlag to false.
            // This typically happens when a sequence of tiles that required a change has concluded,
            // or when no change was necessary for the current tile comparison.
            changeFlag = false ;
        }
    } // End of the for loop.


    // Output the final calculated changeCount to the console.
    console.log ( changeCount ) ;

} // End of the Main function definition.


// Immediately invoke the Main function with input read from standard input.
// This is a common pattern in competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;