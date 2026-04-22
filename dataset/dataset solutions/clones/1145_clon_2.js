// This function computes the Levenshtein distance between two given strings.
// It determines the minimum number of single-character edits (insertions, deletions, or substitutions)
// required to change one word into the other.
function calculateEditDistance ( firstString, secondString ) {
  // Initialize a matrix to store the distances between prefixes of the two strings.
  // The dimensions are (length of first string + 1) by (length of second string + 1).
  let distanceMatrix = new Array ( firstString.length + 1 )
    .fill ( 0 )
    .map ( ( ) => new Array ( secondString.length + 1 ) ) ;

  // Populate the first column of the matrix.
  // The distance from an empty string to a prefix of the first string is its length.
  for ( let rowIdx = 0 ; rowIdx <= firstString.length ; ++rowIdx ) {
    distanceMatrix [ rowIdx ] [ 0 ] = rowIdx ;
  }

  // Populate the first row of the matrix.
  // The distance from an empty string to a prefix of the second string is its length.
  for ( let colIdx = 0 ; colIdx <= secondString.length ; ++colIdx ) {
    distanceMatrix [ 0 ] [ colIdx ] = colIdx ;
  }

  // Iterate through the rest of the matrix to fill in edit distances.
  for ( let rowIdx = 1 ; rowIdx <= firstString.length ; ++rowIdx ) {
    // Get the character code for the current character in the first string.
    let charOneCode = firstString.charCodeAt ( rowIdx - 1 ) ;

    for ( let colIdx = 1 ; colIdx <= secondString.length ; ++colIdx ) {
      // Get the character code for the current character in the second string.
      let charTwoCode = secondString.charCodeAt ( colIdx - 1 ) ;

      // If the characters match, no additional cost for substitution.
      if ( charOneCode === charTwoCode ) {
        distanceMatrix [ rowIdx ] [ colIdx ] = distanceMatrix [ rowIdx - 1 ] [ colIdx - 1 ] ;
      } else {
        // If characters don't match, consider three possibilities:
        // 1. Substitution: cost from diagonal element + 1
        // 2. Deletion: cost from element above + 1
        // 3. Insertion: cost from element to the left + 1
        // Take the minimum of these options.
        distanceMatrix [ rowIdx ] [ colIdx ] = Math.min (
          distanceMatrix [ rowIdx - 1 ] [ colIdx - 1 ] + 1 , // Substitution operation
          distanceMatrix [ rowIdx - 1 ] [ colIdx ] + 1 , // Deletion operation
          distanceMatrix [ rowIdx ] [ colIdx - 1 ] + 1 // Insertion operation
        ) ;
      }
    }
  }

  // The bottom-right element of the matrix contains the total Levenshtein distance.
  return distanceMatrix [ firstString.length ] [ secondString.length ] ;
}


// Asynchronously handle input and output operations.
new Promise ( function ( fulfill, deny ) {
  // Buffer to accumulate incoming standard input data.
  let inputBuffer = "" ;

  // Attach a listener for 'data' events on standard input.
  // Each 'chunk' of data received is appended to the buffer.
  process.stdin.on ( "data" , dataPiece => { inputBuffer += dataPiece ; } ) ;

  // Attach a listener for the 'end' event on standard input.
  // Once all input is received, fulfill the promise with the collected input and standard output stream.
  process.stdin.on ( "end" , ( ) => { fulfill ( [ inputBuffer , process.stdout ] ) ; } ) ;
} ) .then ( function ( [ collectedInput , outputStream ] ) {
  // After the promise is fulfilled, process the collected input.
  // Split the input by newline to get the two strings.
  let [ stringA , stringB ] = collectedInput.split ( "\n" ) ;

  // Calculate the edit distance and write it to the standard output, followed by a newline.
  outputStream.write ( `${calculateEditDistance(stringA, stringB)}\n` ) ;
} ) ;