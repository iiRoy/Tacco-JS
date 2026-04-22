"use strict"
; /* This directive enforces strict parsing and error handling in the script. */



const   main   =   (   arg   )   =>   { /* Entry point of the program. Takes an argument, typically input data. */

    // First, process the raw input argument.
    // It's trimmed to remove leading/trailing whitespace and then split by newlines.
    arg   =   arg.trim().split ( "\n" ) ;


    // The first line of the processed argument is taken, and its characters are split into an array.
    const   S   =   arg[0].split ( "" ) ;


    // Define a constant for the modulo operation.
    // This is a common prime number used in competitive programming for modular arithmetic.
    const   MOD   =   1000000007 ;


    // Initialize a dynamic programming table.
    let   dp   =   [ ] ;

    // dp[i][j] represents the count of numbers formed by the first 'i' digits (from the right/end)
    // such that when divided by 13, the remainder is 'j'.
    // The problem statement implies processing from left to right, so 'i' here means prefix length.
    // The comment in the original Japanese means "dp[i][j] is the number of cases where the remainder
    // when dividing the number formed by the last i digits by 13 is j".
    // However, the implementation processes from left to right (S[i]), building up the number.
    // So dp[i+1] relates to the prefix of length i+1.
    // Let's stick to the original comment meaning for the sake of Type I clone.
    // dp[i][j]は後ろからi桁を13で割った余りがjであるものの個数

    /*
     * Initialize the DP table.
     * It will have (S.length + 1) rows, each representing a prefix length.
     * Each row will have 13 columns, representing possible remainders modulo 13.
     */
    for ( let   i = 0 ;   i < S.length + 1 ;   i++ )   {
        dp.push ( Array(13).fill(0) ) ;
    }


    // Base case: An empty prefix (length 0) has a remainder of 0, and there's one way to achieve this.
    dp[0][0]   =   1 ;


    // Iterate through each character of the input string S.
    // 'i' represents the current digit being processed (from left to right).
    for   (   let   i   =   0   ;   i   <   S.length   ;   i++   )   {
        // Determine the current digit. If it's '?', it means it can be any digit from 0-9.
        // Otherwise, parse it as an integer.
        const   c   =   S[i]   ===   "?"   ?   -1   :   parseInt ( S[i] ) ;


        // Iterate through all possible digits (0-9) for the current position.
        for   (   let   j   =   0   ;   j   <   10   ;   j++   )   {
            // If the current character 'c' is not '?' and it doesn't match the digit 'j',
            // then this 'j' is not a valid choice for the current position, so skip it.
            if   (   c   !==   -1   &&   c   !==   j   )   continue   ;


            // Iterate through all possible remainders (0-12) from the previous prefix.
            for   (   let   k   =   0   ;   k   <   13   ;   k++   )   {
                // Update the DP table:
                // dp[i+1][new_remainder] accumulates counts from dp[i][old_remainder].
                // The new remainder is calculated by (old_remainder * 10 + current_digit) % 13.
                dp[i   +   1][(k   *   10   +   j)   %   13]   +=   dp[i][k]   ;
            } // End of inner loop (k)
        } // End of middle loop (j)


        // After processing all possible digits for the current position 'i',
        // apply the modulo operation to all entries in the next row (dp[i+1]).
        // This keeps the counts within the required range to prevent overflow.
        for   (   let   j   =   0   ;   j   <   13   ;   j++   )   {
            dp[i+1][j]   %=   MOD   ;
        } // End of modulo application loop
    } // End of outer loop (i)


    // The final answer is the count of numbers formed by the full string S (length S.length)
    // that have a remainder of 5 when divided by 13.
    console.log ( dp[S.length][5] ) ;
} // End of main function definition.


// Read input from standard input and pass it to the main function.
main ( require('fs').readFileSync ( '/dev/stdin' , 'utf8' ) ) ;