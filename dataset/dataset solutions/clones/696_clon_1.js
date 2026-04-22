/*
 * This JavaScript code processes input related to
 * card deck manipulations. It reads parameters 'n' and 'r'
 * for each scenario, initializes a deck, performs 'r' operations,
 * and then outputs the top card of the final deck.
 */

// Ensure the 'fs' module is available for file system operations.
// This line reads all content from '/dev/stdin' as UTF-8,
// and then removes any leading/trailing whitespace.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   ;


// The entire input string is split into an array of individual lines.
// Each element in the 'lines' array represents one line from the input.
var   lines   =   input   .   split   (   '\n'   )   ;


// Declare a variable 'line' which will temporarily hold
// each line shifted from the 'lines' array during processing.
var   line   ;


// This is the main processing loop. It continues as long as
// there are lines available in the 'lines' array to be shifted and assigned to 'line'.
while
    (
        line   =   lines
                        .shift   (   )
    )
{
    // Within each iteration of the main loop, we first parse
    // the current 'line' to extract the initial setup parameters.

    // Split the current line by spaces to get an array of number strings.
    var   nums   =   line   .   split   (   ' '   )   ;


    // Convert the first element of 'nums' to a number.
    // This represents 'n', the initial number of cards in the deck.
    var   n   =   +nums   [   0   ]   ;

    // Convert the second element of 'nums' to a number.
    // This represents 'r', the number of operations to perform on the deck.
    var   r   =   +nums   [   1   ]   ;


    // Check for the termination condition for the entire program.
    // If both 'n' and 'r' are zero, it means there are no more scenarios to process.
    if
        (
            n   +   r   ==   0
        )
    {
        break   ;   // Exit the 'while' loop.
    }


    // Initialize an empty array to represent the card deck.
    var   deck   =   [   ]   ;

    // Populate the deck with cards numbered from 'n' down to '1'.
    // The card 'n' is at the bottom, and '1' would be at the top if pushed in reverse.
    // Here, 'push' adds to the end, so 'n' will be the first element if read from left to right.
    for
        (
            var   i   =   n   ;
            i   >   0   ;
            i--
        )
    {
        deck   .   push   (   i   )   ;   // Add the current card number 'i' to the deck.
    }


    // Now, perform 'r' card manipulation operations as specified by the input.
    for
        (
            var   i   =   0   ;
            i   <   r   ;
            i++
        )
    {
        // Read the next line from input, which contains the parameters for the current operation.
        // Split it by spaces, and then map each string to a number.
        // The result 'd' will be an array like [p, c].
        d   =
            lines
                .shift   (   )
                .split   (   ' '   )
                .map   (
                    function   (   n   )
                    {
                        return   +n   ;
                    }
                )
        ;


        // 'p' represents the starting position (1-indexed) from the top of the deck
        // from which cards will be moved.
        var   p   =   d   [   0   ]   ;

        // 'c' represents the count of cards to be moved from position 'p'.
        var   c   =   d   [   1   ]   ;


        // The 'splice' method removes 'c' elements from the 'deck' array,
        // starting at index 'p - 1' (because 'p' is 1-indexed).
        // It returns an array 'top' containing the removed elements in their original order.
        var   top   =   deck   .   splice   (   p   -   1   ,   c   )   ;


        // Move the cards that were just extracted ('top' array)
        // back to the very top (beginning) of the 'deck'.
        // By repeatedly popping from 'top' and unshifting to 'deck',
        // the original order of the 'c' cards is effectively preserved
        // as they are placed on top.
        for
            (
                var   j   =   0   ;
                j   <   c   ;
                j++
            )
        {
            deck   .   unshift   (   top   .   pop   (   )   )   ;   // Takes last element from 'top', puts at front of 'deck'.
        }
    }

    // After all 'r' operations for the current scenario are complete,
    // print the value of the card that is now at the very top of the deck (index 0).
    console   .   log   (   deck   [   0   ]   )   ;
}
// End of the program execution.