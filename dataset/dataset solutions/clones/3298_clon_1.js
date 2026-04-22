// This is a Type I clone of the original JavaScript code.
// The purpose is to demonstrate variations in whitespace and comments only.

'use strict'
; // Enforce strict mode for cleaner code.

( function ( input ) { /* Start of the Immediately Invoked Function Expression (IIFE) */

    // Process the input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into lines based on newline characters.
    // 3. For each line, split by one or more whitespace characters and
    //    then convert each resulting string element to a number.
    input = input . trim ( ) . split ( / \n / ) . map ( str => str . split ( / \s+ / ) . map ( x => x - 0 ) )
    ; // End of input processing.

    // The first number in the input array [0][0] indicates the size N.
    const N = input [ 0 ] [ 0 ]
    ; // Declaration of constant N.

    // Initialize the dynamic programming table 'dp'.
    // dp[i][j] will store the maximum value at step 'i' ending with choice 'j'.
    // The base case for dp[0] is initialized with zeros for all three choices.
    const dp = [
        [ 0 , 0 , 0 ] // Base case for day 0, no points accumulated yet.
    ]
    ; // Initialization of dp table.

    // Iterate from the first step (day 1) up to N (the last day).
    for ( let i = 1 ; i <= N ; i++ ) {

        // Initialize the current row of the DP table (dp[i]) with zeros.
        dp [ i ] = [ 0 , 0 , 0 ]
        ; // Prepare the current day's row.

        // Iterate through the three possible choices (0, 1, 2) for the current step (day 'i').
        for ( let j = 0 ; j < 3 ; j++ ) {

            // Calculate the maximum value for dp[i][j].
            // This is the current input value input[i][j] (points for choice 'j' on day 'i')
            // plus the maximum of the two previous states from day (i-1).
            // The modulo operator ensures we wrap around the choices (0, 1, 2) to
            // select the two choices *different* from the current choice 'j'.
            dp [ i ] [ j ] = Math . max (
                dp [ i - 1 ] [ ( j + 1 ) % 3 ] , // Value from previous day with choice (j+1)%3
                dp [ i - 1 ] [ ( j + 2 ) % 3 ]   // Value from previous day with choice (j+2)%3
            ) + input [ i ] [ j ]
            ; // Calculation of dp[i][j].
        }

    } // End of outer loop (for days).

    // After filling the entire DP table, the final answer is the maximum value
    // found in the last row (dp[N]), which represents the maximum total points
    // accumulated by day N across all possible final choices.
    const ans = Math . max . apply ( null , dp [ N ] )
    ; // Calculate the final answer.

    // Output the final calculated answer to the console.
    console . log ( ans )
    ; // Print the result.

} ) (
    // This immediately invoked function expression (IIFE) receives its input
    // by reading the entire content of '/dev/stdin' as a UTF-8 string.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
)
; // End of the IIFE call and script.

// This concludes the Type I clone generation process.
// All identifiers, operators, and logical structures are preserved.
// Only whitespace and comments have been altered.