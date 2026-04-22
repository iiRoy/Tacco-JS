/*
 * This module provides a utility to compare two sequences of characters
 * and count the positions where they differ.
 */
const computeMismatches = ( rawInputData ) => {
  // Process the raw input string: trim whitespace, split into lines, and convert each line to an array of characters.
  const [ primarySequenceChars, secondarySequenceChars ] = rawInputData
    .trim()
    .split( '\n' )
    .map( ( textLine ) => textLine.split( '' ) );

  // Determine the length of the character sequences (assuming they are of equal length as per problem context).
  const sequenceOverallLength = primarySequenceChars.length;

  // Initialize a counter for discrepancies between the two sequences.
  let discrepancyTally = 0;

  // Iterate through each character position to identify differences.
  for ( let currentPosition = 0; currentPosition < sequenceOverallLength; currentPosition++ ) {
    // If characters at the current position are not identical, increment the discrepancy counter.
    if ( primarySequenceChars[ currentPosition ] !== secondarySequenceChars[ currentPosition ] ) {
      discrepancyTally++;
    }
  }

  // Return the total number of character mismatches found.
  return discrepancyTally;
};

// Main execution block:
// Reads input from standard input, processes it, and prints the result to the console.
console.log(
  computeMismatches(
    require( 'fs' )
      .readFileSync( '/dev/stdin', 'utf8' )
  )
);