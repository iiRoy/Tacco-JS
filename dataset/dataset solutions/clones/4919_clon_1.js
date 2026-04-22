/*
 * This is the primary function responsible for processing the input.
 * It calculates a score based on a specific game logic defined by the problem.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function Main(  input  )
{

    // First, process the raw input string:
    // 1. Trim any leading or trailing whitespace.
    // 2. Split the string into an array of individual characters.
    const data = input.trim().split( "" ) ;


    /*
     * Determine the total number of characters received in the input.
     * This 'N' variable will be used as the upper bound for iteration
     * through the 'data' array.
     */
    var N = data.length ;


    /**
     * Helper function named 'jan' to determine the outcome of a single round
     * based on two "players'" moves. This function encapsulates the core game logic.
     *
     * @param {string} me  - Represents the move made by the first player ('g' for goo, 'p' for paa).
     * @param {string} tki - Represents the move made by the second player (from the input data).
     * @returns {number}   - Returns 0 if it's a draw, -1 if the first player ('me') loses,
     *                         and 1 if the first player ('me') wins.
     */
    function jan(  me  ,  tki  )
    {
        // If both players make the exact same move, the round is a draw.
        if ( me == tki )
        {
            return 0 ;
        }

        // Specific rule: if 'me' plays 'g' (goo) and 'tki' plays 'p' (paa), 'me' loses.
        if ( me == "g"  &&  tki == "p" )
        {
            return -1 ;
        }

        // Specific rule: if 'me' plays 'p' (paa) and 'tki' plays 'g' (goo), 'me' wins.
        if ( me == "p"  &&  tki == "g" )
        {
            return 1 ;
        }
    }

    // Initialize the total score accumulator. This will store the final result.
    var count = 0 ;
    // Initialize the count of 'goo' moves made by the first player throughout the game.
    var goo = 0 ;
    // Initialize the count of 'paa' moves made by the first player throughout the game.
    var paa = 0 ;


    /*
     * Begin the main loop to iterate through each character of the processed input data.
     * The loop variable 'i' represents the current index of the character being evaluated.
     */
    for ( i = 0 ; i < N ; i++ )
    {

        // Handle the very first round (when 'i' is 0) as a special case.
        if ( i === 0 )
        {
            // In the first round, the first player always plays 'g'.
            count += jan( "g" , data[ 0 ] ) ;
            goo++ ; // Increment the 'goo' counter for the first player.
        }
        else
        {
            /*
             * For all subsequent rounds (i > 0), the first player's strategy
             * depends on the current character from the input and the current
             * balance of 'goo' and 'paa' moves already made.
             */

            // Condition 1: If the current input character is 'g' AND the first player
            // has made more 'goo' moves than 'paa' moves so far.
            if ( data[ i ] === "g"  &&  goo > paa )
            {
                // In this scenario, the first player chooses to play 'p'.
                count += jan( "p" , data[ i ] ) ;
                paa++ ; // Increment the 'paa' counter.
            }
            // Condition 2: If the current input character is 'p' AND the first player
            // has made more 'goo' moves than 'paa' moves so far.
            else if ( data[ i ] === "p"  &&  goo > paa )
            {
                // In this scenario, the first player also chooses to play 'p'.
                count += jan( "p" , data[ i ] ) ;
                paa++ ; // Increment the 'paa' counter.
            }
            // Default condition: This covers all other cases not met by the above 'if' and 'else if'.
            // This typically means goo <= paa, or data[i] is something else (though problem implies 'g' or 'p').
            else
            {
                // In these remaining scenarios, the first player chooses to play 'g'.
                count += jan( "g" , data[ i ] ) ;
                goo++ ; // Increment the 'goo' counter.
            }

        }
    }

    // After processing all characters, print the final calculated total score to standard output.
    console.log(  count  ) ;
}


// This line handles reading the input from standard input (/dev/stdin)
// and then invokes the 'Main' function with the read content.
Main(  require( "fs" ).readFileSync( "/dev/stdin" , "utf8" )  ) ;