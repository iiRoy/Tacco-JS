/* This script processes two input strings to determine
 * the minimum number of times the first string (source)
 * must be concatenated to itself to form the second string (target)
 * as a subsequence, and then calculates a final index.
 * It handles input from standard input.
 */
// The main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
console.log( ( ( inputData ) => {
  // Parse the input: trim whitespace, then split into two lines (source and target strings).
  const [ sourceSequence, targetSequence ] = inputData.trim().split( '\n' );

  // Obtain the lengths of both sequences for efficient access.
  const sourceLength = sourceSequence.length;
  const targetLength = targetSequence.length;

  // Initialize variables:
  // `currentSourceIndex`: Tracks the last matched character's position in the source string.
  // `concatenationCount`: Counts how many times the source string has been "cycled" through.
  let currentSourceIndex = -1;
  let concatenationCount = 0;

  // OuterLoopIteration: This label allows breaking directly out of the inner loop
  // and continuing the outer loop from the beginning of its next iteration.
  OuterLoopIteration:
  for ( let targetCharIndex = 0; targetCharIndex < targetLength; targetCharIndex++ ) { // Iterate through each character of the target sequence.
    // Inner loop: Search for the current target character within the source sequence.
    // The search starts from the character *after* the last matched character in the source.
    for ( let searchSourceIndex = currentSourceIndex + 1; searchSourceIndex < sourceLength; searchSourceIndex++ ) {
      // If a match is found between the current target character and a source character...
      if ( sourceSequence[ searchSourceIndex ] === targetSequence[ targetCharIndex ] ) {
        currentSourceIndex = searchSourceIndex; // Update the last matched index in the source.
        continue OuterLoopIteration; // Move to the next character in the target sequence.
      }
    }

    // If the inner loop completes without finding a match for the current target character,
    // and `currentSourceIndex` is still -1 (meaning no character of the target has been matched yet),
    // then the target sequence cannot be formed.
    if ( currentSourceIndex === -1 ) {
      return '-1'; // Indicate failure.
    }

    // If a full scan of the source string didn't find the target character,
    // it means we need to "cycle" to a new concatenation of the source string.
    concatenationCount++; // Increment the count of source string concatenations.
    currentSourceIndex = -1; // Reset the source index to -1 to start searching from the beginning of the source string again.
    targetCharIndex--; // Decrement the target index to re-process the current target character in the new "cycle".
  }

  // Calculate the final result:
  // (Number of full concatenations * length of source string) + (index of last match in the final source string + 1)
  return `${ concatenationCount * sourceLength + currentSourceIndex + 1 }`;

// Execute the IIFE by reading input from standard input.
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) );