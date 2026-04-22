// This file contains a JavaScript program designed to process a string input.
// It identifies the longest consecutive sequence of specific characters (A, C, T, G).

"use strict"; /* Enforce strict parsing and error handling rules for better code quality. */

/**
 * The main function that processes the input string.
 * This function determines the maximum length of a continuous subsequence
 * consisting only of the characters 'A', 'C', 'T', or 'G'.
 *
 * @param {string} input - The raw input string, typically read from standard input.
 *                         It is expected to contain at least one line.
 */
function Main( input )
{

    // Step 1: Process the input string.
    // - `input.split("\n")[0]` extracts the first line of the input.
    // - `.split(/\s/)[0]` then splits that line by any whitespace and takes the first token.
    // - `+ 'X'` appends a sentinel character 'X' to the end. This ensures that
    //   if the input string ends with a valid sequence (e.g., "AACT"), the
    //   length of that sequence is correctly evaluated and updated in 'ans'
    //   before the loop finishes.
    let S = input . split( "\n" )[ 0 ] . split( /\s/ )[ 0 ] + 'X';


    // Step 2: Initialize variables for tracking the sequence.
    // - `ans`: Stores the maximum length of the valid sequence found so far.
    //          Initialized to 0 as no sequence has been found yet.
    // - `l`:   Stores the length of the current consecutive valid sequence.
    //          Initialized to 0, resetting whenever an invalid character is encountered.
    let ans = 0, l = 0;


    // Step 3: Iterate through each character of the processed string 'S'.
    // The loop runs from the first character (index 0) up to, but not including,
    // the sentinel character 'X' (which is at `S.length - 1` if it's the only added char).
    for ( let n = 0; n < S . length; n++ )
    {

        // Use a switch statement to efficiently check the current character.
        switch ( S . charAt( n ) )
        {
            // Case 1: The current character is one of the valid DNA bases.
            case 'A':
            case 'C':
            case 'T':
            case 'G':
                // Increment the length of the current valid sequence.
                l += 1;
                break; // Exit the switch statement and continue to the next character in the loop.

            // Case 2: The current character is anything else (an invalid character).
            default:
                // First, check if the length of the sequence just completed ('l')
                // is greater than the previously recorded maximum length ('ans').
                if ( l > ans )
                {
                    // If it is, update 'ans' to this new maximum.
                    ans = l;
                }
                // Reset the current sequence length 'l' to 0 because
                // the continuous sequence of valid characters has been broken.
                l = 0;
                break; // Exit the switch statement.
        }
    }


    // Step 4: Output the final result.
    // After the loop has processed all characters (including the sentinel 'X'),
    // 'ans' will hold the longest sequence of 'A', 'C', 'T', 'G' characters.
    // This value is then printed to the standard output.
    console . log( ans );
}


/*
 * This section is responsible for executing the Main function.
 * It reads input from the standard input stream and passes it to Main.
 *
 * `require("fs")`: Imports the Node.js File System module.
 * `readFileSync("/dev/stdin", "utf8")`: Reads the entire content of
 *                                       the standard input file synchronously
 *                                       and decodes it as a UTF-8 string.
 * This read string is then passed as the `input` argument to the `Main` function.
 */
Main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );