'use strict' /* This directive enables strict mode for the entire script. */

/**
 * Solves the Longest Common Subsequence (LCS) problem for two strings.
 *
 * @param {string} S - The first input string.
 * @param {string} T - The second input string.
 * @returns {string} The longest common subsequence string.
 */
function solve ( S, T ) {
    // Initialize a 2D DP array. Each cell stores [length_of_lcs, lcs_string].
    // The dimensions are (S.length + 1) x (T.length + 1).
    // All cells are initialized to [0, ''] indicating an empty LCS.
    var dp = new Array( S.length + 1 )
                   .fill( 0 )
                   .map( e => new Array( T.length + 1 ).fill( [ 0, '' ] ) );

    // Iterate through the strings S and T to fill the DP table.
    // i represents the current index in string S (1-based).
    for ( var i = 1; i <= S.length; i++ ) {
        // j represents the current index in string T (1-based).
        for ( var j = 1; j <= T.length; j++ ) {
            // Check if the characters at the current positions match.
            // S[i-1] and T[j-1] are used for 0-based indexing.
            if ( S[ i - 1 ] === T[ j - 1 ] ) {
                // If characters match, extend the LCS from the diagonal cell (dp[i-1][j-1]).
                // Increment the length and append the matching character to the string.
                dp[ i ][ j ] = [
                    1 + dp[ i - 1 ][ j - 1 ][ 0 ],
                    dp[ i - 1 ][ j - 1 ][ 1 ] + S[ i - 1 ]
                ];
            } else {
                // If characters do not match, take the maximum LCS from
                // either excluding the character from S (dp[i-1][j])
                // or excluding the character from T (dp[i][j-1]).

                // Determine the maximum length.
                var val = dp[ i ][ j - 1 ][ 0 ] > dp[ i - 1 ][ j ][ 0 ]
                          ? dp[ i ][ j - 1 ][ 0 ]
                          : dp[ i - 1 ][ j ][ 0 ];

                // Determine the corresponding LCS string.
                var s = dp[ i ][ j - 1 ][ 0 ] > dp[ i - 1 ][ j ][ 0 ]
                        ? dp[ i ][ j - 1 ][ 1 ]
                        : dp[ i - 1 ][ j ][ 1 ];

                // Assign the chosen length and string to the current DP cell.
                dp[ i ][ j ] = [ val, s ];
            }
        }
    }
    // The final LCS string is stored in the bottom-right cell of the DP table.
    return dp[ S.length ][ T.length ][ 1 ];
}

/**
 * Main function to read input, call the solver, and print the result.
 *
 * @param {string} input - The raw input string containing S and T on separate lines.
 */
function main ( input ) {
    // Split the input string by newline to get individual lines.
    var lines = input.split( "\n" );

    // The first line is string S.
    var S = lines[ 0 ];

    // The second line is string T.
    var T = lines[ 1 ];

    // Call the solve function with the extracted strings.
    var ans = solve( S, T );

    // Print the computed answer to the console.
    console.log( ans );
}

// Read input from stdin and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );

/* End of program. */