'use strict' ; // This directive enables strict mode, which helps in writing cleaner and safer JavaScript code.

// This is an Immediately Invoked Function Expression (IIFE).
// It creates a private scope for the script, preventing variables from polluting the global namespace.
( function (   input   ) {

    // --- Input Processing Section ---
    // 1. `input.trim()`: Removes any leading or trailing whitespace from the raw input string.
    // 2. `split(/\s+/)`: Splits the string into an array of substrings, using one or more whitespace characters as the delimiter.
    // 3. `.map(x => x - 0)`: Converts each string element in the array to a number.
    //    Subtracting 0 is a common and concise way to achieve numeric type conversion in JavaScript.
    input   =   input   .   trim   (   )   .   split   (   / \s + /   )   .   map   (   x   =>   x   -   0   )   ;


    // --- Variable Initialization ---
    // `input.shift()` removes the first element from the array and returns it.
    // This is used to extract N and K, which are typically the first two numbers in competitive programming inputs.
    const   N   =   input   .   shift   (   )   ;   // N represents the number of elements in array A.
    const   K   =   input   .   shift   (   )   ;   // K represents the target value or maximum state.

    // The rest of the `input` array now contains the values for array A.
    const   A   =   input   ;                   // A contains the possible moves or values.


    // --- Dynamic Programming (DP) Table Setup ---
    // Create a new array named `dp` with a size of `K + 2`.
    // This allows for indexing from 0 up to K+1.
    // `.fill('tbd')`: Initializes all elements of the `dp` array with the string 'tbd' (to be determined).
    // This helps distinguish between states that are not yet evaluated and those explicitly marked as true/false.
    const   dp   =   new   Array   (   K   +   2   )   .   fill   (   'tbd'   )   ;


    // --- Base Case for DP ---
    // The state `K + 1` is explicitly set to `true`.
    // In many game theory problems (like Nim or Subtract Square), a state beyond the target (e.g., exceeding K)
    // is considered a winning state for the player who makes the last move to reach it.
    dp   [   K   +   1   ]   =   true   ;


    // --- Main DP Calculation Loop ---
    // Iterate backwards from `K + 1` down to `0`.
    // `i` represents the current state (e.g., number of stones remaining, or current value).
    for   (   let   i   =   K   +   1   ;   i   >=   0   ;   i   --   )
    {
        // --- Logic for when `dp[i]` is a winning state (or considered true) ---
        if   (   dp   [   i   ]   )
        {
            // Optimization / Specific Game Rule Check:
            // If the current state `i` is a winning state, and the previous state `i-1` was also a winning state,
            // this might indicate a specific pattern or a move that leads to a win.
            // The logic here is to skip the calculation for `i-1` if it's already known to be true.
            if   (   dp   [   i   -   1   ]   ===   true   )
            {
                i   --   ;       // Decrement `i` again to skip the next iteration's evaluation of `i-1`.
                continue   ;    // Move to the next iteration of the outer loop.
            }

            // This nested loop seems to be part of a specific game rule, possibly related to `A[0]`.
            // It iterates `j` from 1 up to the value of `A[0]`.
            for   (   let   j   =   1   ;   j   <=   A   [   0   ]   ;   j   ++   )
            {
                // Check if the state `i - j` is a valid (non-negative) state.
                if   (   i   -   j   >=   0   )
                {
                    // If `dp[i]` is true (winning state), and by taking `j` units,
                    // the opponent lands in state `i - j`.
                    // If `dp[i - j]` has not yet been determined ('tbd'),
                    // and `i` is a winning state, it implies that the player landing in `i - j`
                    // is forced into a losing position if the move from `i - j` leads to `i`.
                    // Therefore, `i - j` is marked as a losing state (`false`).
                    if   (   dp   [   i   -   j   ]   ===   'tbd'   )
                    {
                        dp   [   i   -   j   ]   =   false   ;   // Mark as a losing state.
                    }
                }
            }
        }

        // --- Logic for when `dp[i]` is a losing state (or not yet determined) ---
        // If `dp[i]` is not true (meaning it's `false` or still `'tbd'`),
        // we check if there's any move from state `i` that can lead to a winning state.
        if   (   !   dp   [   i   ]   )
        {
            // Iterate through all possible moves defined in the array `A`.
            for   (   let   a   =   0   ;   a   <   N   ;   a   ++   )
            {
                // Check if the move `A[a]` from state `i` results in a valid (non-negative) state.
                if   (   i   -   A   [   a   ]   >=   0   )
                {
                    // If we are in state `i` (which is currently a losing or unknown state),
                    // and we can reach state `i - A[a]` by making a move `A[a]`.
                    // This logic implies that if a state `i` is not a winning state,
                    // then any state `i - A[a]` that can lead to `i` must be a winning state
                    // for the player who makes the move to `i`.
                    // This effectively means: if you can move to a losing state (i), then your current state (i-A[a]) is a winning state.
                    dp   [   i   -   A   [   a   ]   ]   =   true   ;   // Mark as a winning state.
                }
            }
        }
    }


    // --- Final Result Output ---
    // After the DP table is fully populated, `dp[0]` represents the starting state of the game (0 stones remaining).
    // If `dp[0]` is `true`, it means the first player to move wins.
    if   (   dp   [   0   ]   )
    {
        console   .   log   (   'First'   )   ;   // Output 'First' if the first player wins.
    }
    // Otherwise, if `dp[0]` is `false` (or 'tbd' in some edge cases, though it should be resolved),
    // it means the second player wins.
    else
    {
        console   .   log   (   'Second'   )   ;   // Output 'Second' if the second player wins.
    }

} ) (
    // --- IIFE Invocation with Input Source ---
    // This part calls the IIFE defined above, passing the input as an argument.
    // `require('fs').readFileSync('/dev/stdin', 'utf8')`:
    //   - `require('fs')`: Imports the Node.js File System module.
    //   - `.readFileSync('/dev/stdin', 'utf8')`: Reads the entire content of the standard input (`/dev/stdin`)
    //     synchronously as a UTF-8 encoded string. This is a common pattern in competitive programming.
    require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)   ;