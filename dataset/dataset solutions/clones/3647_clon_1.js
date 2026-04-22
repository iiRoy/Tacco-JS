/*
 * This JavaScript file implements a solution for a dynamic programming problem.
 * It processes a string input to count specific patterns.
 * The 'use strict' directive enables strict mode, which helps catch common coding errors.
 */
"use strict" ;

// Main function: Entry point for the program logic.
// It takes the raw input string as an argument.
function Main ( input )
{
    // Initialize an Inputer object to parse the input string.
    let cin = new Inputer ( input ) ;

    // Read the primary string S from the input.
    let S = cin . getStr ( ) ;

    // Calculate the length of the string S.
    let N = S . length ;

    // Define a constant string "ABC" for pattern matching.
    const ABC = "ABC" ;

    // Define the modulo constant, commonly used in competitive programming for large numbers.
    const MOD = 1e9 + 7 ; // Equivalent to 1,000,000,007

    /*
     * Initialize a 2D DP (Dynamic Programming) array.
     * Dimensions: (N + 1) rows by (3 + 1) columns.
     * All elements are initially filled with 0.
     * This DP table will store the number of ways to form "ABC" or parts of it.
     */
    let dp = new Array ( N + 1 )
        . fill ( 0 )
        . map ( ( ) => new Array ( 3 + 1 ) . fill ( 0 ) ) ;

    // Iterate through the string S from right to left (N down to 0).
    // This is typical for DP problems where subproblems depend on future states.
    for ( let i = N ; i >= 0 ; -- i )
    {
        // Iterate through the target pattern "ABC" from right to left (3 down to 0).
        // `j` represents the current character index we are trying to match in "ABC".
        for ( let j = 3 ; j >= 0 ; -- j )
        {
            // Base case: If we have processed the entire string S (i == N).
            if ( i == N )
            {
                // If j is 3, it means we have successfully matched "ABC".
                // So, there's 1 way to complete the pattern.
                dp [ i ] [ j ] = ( j == 3 ? 1 : 0 ) ;
            }
            // Recursive step: If we are still processing the string S.
            else
            {
                /*
                 * Calculate the number of ways without matching the current character S[i]
                 * for the j-th character of "ABC".
                 * If S[i] is '?', it can be any of 3 characters (A, B, C), so multiply by 3.
                 * Otherwise, it's a fixed character, so multiply by 1.
                 */
                dp [ i ] [ j ] = dp [ i + 1 ] [ j ] * ( S [ i ] == '?' ? 3 : 1 ) ;

                /*
                 * Consider matching S[i] with the j-th character of "ABC".
                 * This condition is met if:
                 * 1. We haven't completed "ABC" yet (j < 3).
                 * 2. S[i] is '?' (can be anything) OR S[i] matches ABC[j].
                 */
                if ( j < 3 && ( S [ i ] == '?' || S [ i ] == ABC [ j ] ) )
                {
                    // Add the number of ways from the next state (i+1, j+1).
                    // This represents matching S[i] to ABC[j] and then continuing.
                    dp [ i ] [ j ] += dp [ i + 1 ] [ j + 1 ] ;
                }

                // Apply modulo operation to keep the result within bounds.
                dp [ i ] [ j ] %= MOD ;
            }
        }
    }

    // The final answer is stored at dp[0][0], representing the count of "ABC"
    // patterns from the beginning of the string S, starting to match 'A'.
    console . log ( dp [ 0 ] [ 0 ] ) ;
}


/**
 * Helper class for parsing input efficiently.
 * It splits the input string by newlines and spaces.
 */
class Inputer
{
    /**
     * Constructor for the Inputer class.
     * @param {string} t - The raw input string to be processed.
     */
    constructor ( t )
    {
        this . cnt = 0 ; // Counter for the current item index.
        // Split the input string into an array of items using newline or space as delimiters.
        this . items = t . split ( /\n|\s/ ) ;
    }

    /**
     * Retrieves the next integer from the input stream.
     * @returns {number} The parsed integer.
     */
    getInt ( )
    {
        // Parse the current item as an integer and increment the counter.
        return this . items [ this . cnt ++ ] - 0 ;
    }

    /**
     * Retrieves an array of integers from the input stream.
     * @param {number} t - The number of integers to retrieve.
     * @returns {number[]} An array containing the parsed integers.
     */
    getIntArray ( t )
    {
        let r = new Array ( t ) ; // Create a new array to store the integers.
        // Loop 't' times to populate the array.
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getInt ( ) ; // Get each integer using getInt().
        }
        return r ;
    }

    /**
     * Retrieves the next string token from the input stream.
     * @returns {string} The next string token.
     */
    getStr ( )
    {
        // Return the current item as a string and increment the counter.
        return this . items [ this . cnt ++ ] ;
    }

    /**
     * Retrieves an array of string tokens from the input stream.
     * @param {number} t - The number of string tokens to retrieve.
     * @returns {string[]} An array containing the string tokens.
     */
    getStrArray ( t )
    {
        let r = new Array ( t ) ; // Create a new array to store the strings.
        // Loop 't' times to populate the array.
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getStr ( ) ; // Get each string using getStr().
        }
        return r ;
    }
}


/*
 * This conditional block handles the execution environment.
 * If the code is not running in a browser environment (i.e., 'window' is undefined),
 * it assumes a Node.js environment and reads input from standard input.
 * Otherwise, it's assumed to be in a browser, and input might come from other sources
 * (though this specific setup is for competitive programming on platforms like AtCoder).
 */
if ( typeof window == "undefined" )
{
    // Read the entire content of standard input as a UTF-8 string.
    // Then, pass it to the Main function for processing.
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
}