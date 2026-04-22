/*
 * This JavaScript file processes standard input to determine
 * poker hand types based on a sequence of comma-separated numbers.
 *
 * It reads card values from standard input, sorts them, and then
 * applies a set of rules to identify specific poker hands like
 * "four card", "full house", and "straight".
 *
 * Author:   Code Clone Generation System
 * Version:  1.0.0
 * Date:     2023-10-27
 * License:  Public Domain (for the cloned code, based on original source)
 */

// --- Standard Input Processing Setup ---

// Import the Node.js 'fs' (file system) module.
// This module provides an API for interacting with the file system,
// which includes standard input/output streams.
var fs = require( 'fs' );

// Determine the total byte size of the standard input stream.
// This is necessary to allocate a buffer of appropriate size.
var length = fs.fstatSync( process.stdin.fd ).size;

// Create a new Buffer object with the determined length.
// This buffer will temporarily store the raw data read from stdin.
var buffer = new Buffer( length );

// Read data synchronously from standard input into the allocated buffer.
// Parameters: file descriptor (stdin.fd), buffer, offset, length, position.
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 );

// Convert the buffer content to a UTF-8 string.
// Then, remove any leading or trailing whitespace from the string.
// Finally, split the string into an array of lines based on the newline character.
var input = buffer
              .toString( 'utf8', 0, bytesRead )
              .trim()
              .split( '\n' );

// Execute the main processing function immediately after input has been prepared.
main();


/**
 * The core function of the program.
 * It iterates through each line of processed input, interprets card values,
 * and determines the type of poker hand for each set of cards.
 */
function main() {

  // Loop through each entry (each line of cards) in the 'input' array.
  // 'i' is the current index, 'len' stores the total number of input lines.
  for ( var i = 0, len = input.length; i < len; i++ ) {

    // Process the current line of cards:
    // 1. input[i].trim(): Remove any leading/trailing whitespace from the current line.
    // 2. .split(','): Split the cleaned string into an array of strings, using comma as a delimiter.
    // 3. .sort(function(a,b){return b-a;}): Sort the array numerically in descending order.
    //    This places the highest card value first.
    // 4. .map(Number): Convert each string element in the sorted array to its numeric equivalent.
    var c = input[i]
              .trim()
              .split( ',' )
              .sort( function( a, b ) {
                return b - a; // Sort numerically in descending order
              })
              .map( Number ); // Convert all elements to numbers


    // Initialize the 'result' variable with a default value of "null".
    // This will be updated if a specific poker hand is recognized.
    var result = "null";


    // --- Poker Hand Evaluation Logic ---

    // Check for "four card" (Four of a Kind).
    // This condition checks if either the first four cards are identical
    // OR if the last four cards are identical.
    if ( ( c[0] == c[1]  &&  c[1] == c[2]  &&  c[2] == c[3] )  ||
         ( c[1] == c[2]  &&  c[2] == c[3]  &&  c[3] == c[4] )
       ) {
      result = "four card";
    }

    // Otherwise, if not a "four card", check for "full house".
    // A full house consists of three cards of one rank and two cards of another rank.
    // Condition 1: (AAA BB) - First three cards are the same, and the last two are the same.
    // Condition 2: (AA BBB) - First two cards are the same, and the last three are the same.
    else if ( ( c[0] == c[1]  &&  c[1] == c[2]  &&  c[3] == c[4] )  ||
              ( c[0] == c[1]  &&  c[2] == c[3]  &&  c[3] == c[4] )
            ) {
      result = "full house";
    }

    // Otherwise, if not "four card" or "full house", check for "straight".
    // A straight is five cards in sequential rank.
    // The first part of the condition (c[0] == c[1] + 1 && ...) checks for sequential order.
    // The second part handles the special case of an Ace-low straight (e.g., 5-4-3-2-A),
    // where Ace is represented as 1 and also as 13 for other purposes.
    else if ( ( c[0] == c[1] + 1  &&  // Check if c0 is one greater than c1
                c[1] == c[2] + 1  &&  // Check if c1 is one greater than c2
                c[2] == c[3] + 1 )  && // Check if c2 is one greater than c3
              ( ( c[0] == 13  &&  c[4] == 1 )  ||  // Special case: Ace-low straight (e.g., K,Q,J,T,A where A=1)
                ( c[3] == c[4] + 1 )               // Standard straight: c3 is one greater than c4
              )
            ) {
      result = "straight";
    }


    // Output the determined poker hand type to the console for the current line of input.
    console.log( result );

  } // End of the 'for' loop that processes each input line.

} // End of the 'main' function.