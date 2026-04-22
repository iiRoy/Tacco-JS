"use strict" ; // This directive enforces strict mode for the entire script.

/*
 * @fileoverview This script solves a specific problem from AtCoder,
 *               often referred to as "Card Game for Two".
 *
 * @see {@link https://practice.contest.atcoder.jp/tasks/practice_1} - Official problem link for reference.
 *
 * @param {string} input - The complete input string provided via standard input.
 *                         It typically contains multiple lines, where the first line
 *                         is the count of cards (N), and the second line lists the
 *                         N card values separated by spaces.
 * @returns {string} - The calculated difference between Alice's score and Bob's score,
 *                     which will be printed to standard output.
 */
var    main = function ( input ) {


    // The problem setup typically involves two lines of input.
    // The first line is 'N', the number of cards.
    // The second line contains 'N' space-separated integer values representing the cards.
    // We are interested in the second line for card values.
    const params = input . split( "\n" ) [ 1 ] ; // Extracts the second line (index 1) which contains card values.
                                               // Note: The 'params' variable itself is not directly used further,
                                               //       but its derived components are.


    // Step 1: Parse the card values from the input string.
    // Step 2: Convert these string values into actual numbers.
    // Step 3: Sort the cards in descending order to implement the greedy strategy.
    const cards = input . split( "\n" ) [ 1 ]             // Retrieve the line containing card numbers.
                        . split( " " )                    // Split this line by space to get an array of number strings.
                        . map( x => parseInt( x ) )       // Convert each string element 'x' to its integer representation.
                        . sort( ( a , b ) => b - a ) ;    // Sort the array in descending order (largest card first).
                                                          // This ensures that when players pick alternately, they get optimal cards.


    // Alice picks the first card, then the third, fifth, etc. (cards at even indices: 0, 2, 4...).
    // These will be the largest available cards in the sorted list.
    const alice = cards . filter( ( x , i ) => i % 2 === 0 ) // Filter the cards array, keeping only elements at even indices.
                        . reduce( ( a , b ) => a + b ) ;     // Sum all the cards Alice has picked.


    // Bob picks the second card, then the fourth, sixth, etc. (cards at odd indices: 1, 3, 5...).
    // These will be the second largest available cards in the sorted list.
    const bob   = cards . filter( ( x , i ) => i % 2 === 1 ) // Filter the cards array, keeping only elements at odd indices.
                        . reduce( ( a , b ) => a + b ) ;     // Sum all the cards Bob has picked.


    // The problem asks for the difference between Alice's total score and Bob's total score.
    return alice - bob ;

} ; // End of the 'main' function.


// --- Main Execution Flow ---
// This section handles the input/output operations for the script.

// Read the entire content of standard input synchronously.
// The input is expected to be encoded in UTF-8.
const output = main ( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;

// Print the computed result to standard output.
// console.log automatically appends a newline character at the end of the output.
console . log( output ) ;