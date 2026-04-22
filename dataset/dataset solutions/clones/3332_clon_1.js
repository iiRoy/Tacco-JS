/*
 * This JavaScript code implements a dynamic programming solution
 * for a game theory problem, determining the winner of a game.
 *
 * The 'use strict' directive ensures that the code runs in strict mode,
 * which helps prevent common errors and "unsafe" actions.
 */
'use strict' ;


// This entire script is wrapped within an Immediately Invoked Function Expression (IIFE).
// This pattern helps create a private scope for variables and avoids polluting the global namespace.
( function ( input ) {


    // --- Input Processing and Variable Initialization ---

    // The raw input string is first trimmed to remove any leading or trailing whitespace.
    // Then, it's split into an array of strings using one or more whitespace characters as delimiters.
    // Finally, the `map` function converts each string element in the array to a number.
    // The `x - 0` trick is a concise way to achieve string-to-number conversion.
    input = input . trim ( ) . split ( /\s+/ ) . map ( x => x - 0 ) ;


    // 'N' represents the number of distinct move options available in the game.
    // It is extracted from the beginning of the processed input array using `shift()`.
    const N = input . shift ( ) ;


    // 'K' represents the initial size or target state of the game pile/value.
    // It is also extracted from the input array.
    const K = input . shift ( ) ;


    // 'A' is an array containing the allowed move sizes.
    // After N and K are shifted, 'input' itself becomes the array of moves.
    const A = input ;


    // 'dp' is our dynamic programming array.
    // Its size is K + 2 to accommodate indices from 0 up to K + 1.
    // Each element is initially set to the string 'tbd' (to be determined).
    const dp = new Array ( K + 2 ) . fill ( 'tbd' ) ;


    // --- Game Logic and Dynamic Programming Calculation ---

    // Base case for the DP: The state K + 1 is set to 'true'.
    // In this specific game context, 'true' usually signifies a winning state for the current player.
    // However, depending on the game, K+1 might be an 'impossible' state or a state from which the current
    // player automatically wins or loses. Here, the original code sets it to true.
    dp [ K + 1 ] = true ;


    // The main loop iterates backwards from K + 1 down to A[0].
    // This approach is typical for DP problems where the solution for state 'i'
    // depends on solutions for states smaller than 'i'.
    for ( let i = K + 1 ; i >= A [ 0 ] ; i-- ) {

        // Check if the current state 'i' is considered a winning state (dp[i] is true).
        if ( dp [ i ] )
        {
            // If dp[i] is true, we then check the state i - 1.
            // This nested if-statement is crucial for the game's specific rules.
            if ( dp [ i - 1 ] === true )
            {
                // If dp[i-1] is also true, it means the current player can win from i-1.
                // In this case, we simply continue to the next iteration of the outer loop,
                // skipping further processing for this 'i' value in this specific branch.
                continue ;
            }

            // This block is executed if dp[i] is true, but dp[i-1] is not (or is 'tbd').
            // It iterates through a subset of possible moves (from 1 up to A[0]).
            for ( let j = 1 ; j <= A [ 0 ] ; j++ )
            {
                // Ensure that the resulting state `i - j` is non-negative.
                if ( i - j >= 0 )
                {
                    // If the state `i - j` has not yet been determined ('tbd').
                    if ( dp [ i - j ] === 'tbd' )
                    {
                        // Mark `i - j` as a losing state (false) for the current player.
                        // This implies that if `i` is a winning state, and `i-j` is reachable,
                        // and `i-j` is 'tbd', then it becomes a losing state.
                        dp [ i - j ] = false ;
                    }
                }
            }
        }


        // This block executes if the current state 'i' is *not* a winning state (i.e., dp[i] is false).
        if ( ! dp [ i ] )
        {
            // If the current player loses from state 'i', it means any state `i - A[a]`
            // from which 'i' can be reached, becomes a winning state for the player
            // who makes the move to 'i' (since 'i' is a losing state for the *next* player).
            for ( let a = 0 ; a < N ; a++ )
            {
                // Ensure that the resulting state `i - A[a]` is non-negative.
                if ( i - A [ a ] >= 0 )
                {
                    // Mark `i - A[a]` as a winning state (true) for the current player.
                    dp [ i - A [ a ] ] = true ;
                }
            }
        }
    }


    // --- Outputting the Result ---

    // After the DP table is fully computed, we check the state for pile size 0.
    // If `dp[0]` is true, it means the first player can force a win from an initial pile of 0.
    if ( dp [ 0 ] === true ) console . log ( 'First' ) ;
    // Otherwise, if `dp[0]` is false, the second player wins.
    else console . log ( 'Second' ) ;


} ) (
    // The IIFE is immediately invoked with the input read from standard input.
    // `require('fs').readFileSync` reads the content of the file at '/dev/stdin'.
    // 'utf8' specifies the character encoding for the input.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ; // End of the Immediately Invoked Function Expression.