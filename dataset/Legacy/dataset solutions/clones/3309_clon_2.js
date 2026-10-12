'use strict'; // Enforce strict mode for cleaner code.


// Output the final computed result of an immediately invoked function expression (IIFE).
console.log(
  ( function ( rawInputData ) { /*
   * This function implements a dynamic programming approach
   * to determine the Longest Common Subsequence (LCS)
   * of two input strings.
   * The expected input format is two distinct lines of text.
   */

    // Pre-process the raw input: trim any surrounding whitespace and split into individual lines.
    const stringComponents = rawInputData.trim().split( '\n' );

    // Extract the two primary sequences that will be compared.
    const primarySequence = stringComponents[ 0 ]; // Represents the first sequence.
    const secondarySequence = stringComponents[ 1 ]; // Represents the second sequence.


    // Calculate the respective lengths of the two sequences.
    const primarySequenceLength   = primarySequence.length;
    const secondarySequenceLength = secondarySequence.length;

    // Initialize a 2D array (matrix) for dynamic programming.
    // This table will store the LCS of prefixes of the two sequences.
    // The dimensions are (primarySequenceLength + 1) x (secondarySequenceLength + 1).
    // Each cell is initially filled with an empty string.
    const lcsResultMatrix = Array( primarySequenceLength + 1 )
      .fill( 0 ) // A temporary fill value before mapping.
      .map( ( _unusedElement ) =>
        Array( secondarySequenceLength + 1 )
          .fill( '' ) // Each cell will eventually hold an LCS string.
      );

    /*
     * Iterate through the sequences to populate the lcsResultMatrix.
     * This is a bottom-up computation of the LCS.
     */
    for ( let currentPrimaryIdx = 0; currentPrimaryIdx < primarySequenceLength; currentPrimaryIdx++ ) {

      for ( let currentSecondaryIdx = 0; currentSecondaryIdx < secondarySequenceLength; currentSecondaryIdx++ ) {

        // Compare the characters at the current indices from both sequences.
        if ( secondarySequence[ currentSecondaryIdx ] === primarySequence[ currentPrimaryIdx ] ) {
          // If characters match, extend the LCS from the diagonally preceding cell.
          // The current LCS is formed by appending the matching character to the LCS of the preceding substrings.
          lcsResultMatrix[ currentPrimaryIdx + 1 ][ currentSecondaryIdx + 1 ] = lcsResultMatrix[ currentPrimaryIdx ][ currentSecondaryIdx ] + primarySequence[ currentPrimaryIdx ];
        }
        else {
          // If characters do not match, take the longer LCS from the two adjacent cells:
          // 1. Excluding the current character of the primary sequence.
          // 2. Excluding the current character of the secondary sequence.
          lcsResultMatrix[ currentPrimaryIdx + 1 ][ currentSecondaryIdx + 1 ] =
            lcsResultMatrix[ currentPrimaryIdx + 1 ][ currentSecondaryIdx ].length > lcsResultMatrix[ currentPrimaryIdx ][ currentSecondaryIdx + 1 ].length
              ? lcsResultMatrix[ currentPrimaryIdx + 1 ][ currentSecondaryIdx ]
              : lcsResultMatrix[ currentPrimaryIdx ][ currentSecondaryIdx + 1 ];
        }
      }
    }

    // The cell at the bottom-right corner of the matrix contains the Longest Common Subsequence
    // of the entire primary and secondary sequences.
    return lcsResultMatrix[ primarySequenceLength ][ secondarySequenceLength ];

  // The input data for this function is read synchronously from standard input using Node.js 'fs' module.
  }( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )
);