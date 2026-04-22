/*
 * This is a Type I clone of the original JavaScript code.
 * The core logic and structure remain identical.
 * Only whitespace and comments have been altered significantly.
 */
// The 'input' parameter will contain the entire input data as a string.
function Main(  input  ) {
    // Split the input string by newline characters to get an array of lines.
    var    input   =   input.split( '\n' )   ;
    var    answer  ; // This variable will store the final answer.


    // Take the first line of input and split it into an array of characters.
    var chars       = input[0].split( '' ) ;
    // Initialize the current player's turn.
    var currentPlayer = 'First' ;

    /**
     * This function simulates a player taking a character from the 'chars' array.
     * @param {Array<number>} indexTriplet - An array containing three indices [i, i+1, i+2].
     *                                      The character at indexTriplet[1] (the middle one) is removed.
     */
    function take ( indexTriplet )
    {
        chars.splice( indexTriplet[1] , 1 ) ; // Remove one character at the specified index.
        console.log( chars ) ; // Log the modified characters array for debugging.
    }


    /*
     * This function checks if a character can be 'taken' based on a specific rule.
     * The rule is: the characters at the first and third indices of the triplet must not be equal.
     * @param {Array<number>} indexTriplet - An array of three indices.
     * @returns {boolean} - True if the character can be taken, false otherwise.
     */
    function canTake( indexTriplet )
    {
        return !( chars[ indexTriplet[0] ] === chars[ indexTriplet[2] ] ) ;
    }


    /*
     * This function represents a single turn in the game.
     * It iterates through possible triplets of characters and attempts to 'take' one.
     * @param {Array<string>} chars - The current array of characters.
     * @returns {boolean} - True if a character was successfully taken, false if no move was possible.
     */
    function playTurn ( chars )
    {
        var   indexTriplet   ; // Declare a variable to hold the current index triplet.

        // Loop through the characters array, considering triplets of indices.
        // The loop continues as long as there are at least 3 characters remaining to form a triplet.
        for ( var i = 0 ; i < ( chars.length - 2 ) ; i++ )
        {
            // Form the current index triplet.
            indexTriplet = [ i , i + 1 , i + 2 ] ;

            console.log( indexTriplet ) ; // Log the current triplet being considered.
            // Check if the current triplet allows a character to be taken.
            if ( canTake( indexTriplet ) )
            {
                take( indexTriplet ) ; // If it can, perform the 'take' action.
                return true ;          // A move was made, so return true.
            }

            // If a move wasn't made with this triplet, continue to the next one.
            continue ;
        }
        return false ; // No possible moves were found in this turn.
    }


    /**
     * This function orchestrates the turns between players until no more moves can be made.
     */
    function cycleTurns ( )
    {
        // Continue playing turns until a player cannot make a move.
        while ( true )
        {
            // Attempt to play a turn. If no move is possible, exit the loop.
            if ( playTurn( chars ) === false )
            {
                return ;
            }

            // It's time to switch to the next player.
            // Toggle between 'First' and 'Second' player.
            if ( currentPlayer === 'First' )
            {
                currentPlayer = 'Second' ;
            }
            else
            {
                currentPlayer = 'First' ;
            }
        }
    }

    // Start the game by cycling through turns.
    cycleTurns( ) ;

    // Determine the final winner based on whose turn it is when the game ends.
    // The player who *cannot* make a move loses, so the *other* player wins.
    if ( currentPlayer === 'First' )
    {
        answer = 'Second' ; // If it was 'First' player's turn to move but they couldn't, 'Second' wins.
    }
    else
    {
        answer = 'First' ;  // Otherwise, 'First' player wins.
    }

    // Output the final answer to the console.
    console.log( answer ) ;
}
// Do not edit anything below this line. This part handles standard input/output.
// Reads all input from stdin and calls the Main function with it.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;