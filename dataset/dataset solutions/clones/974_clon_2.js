let dataStream = require('fs') .readFileSync( '/dev/stdin' , 'utf8' ) ;
// Acquire the raw input data from the standard input source as a UTF-8 string

let lineSegments = dataStream.trim() .split("\n");
// Pre-process the obtained data: remove leading/trailing whitespace, then divide into an array of strings based on newline characters

let mainSequence = lineSegments[0]; // The primary textual content where patterns will be sought
let targetPattern = lineSegments[1]; // The specific sequence of characters to locate within the main sequence

let foundPositions = "";
// Initialize an empty string to store the zero-based starting indices where the target pattern is successfully matched.
// Each index will be followed by a newline character for formatting.

// Begin iterating through the primary string from its start to its end.
// 'outerIdx' represents the current potential starting position for a pattern match.
for ( let outerIdx = 0 ; outerIdx < mainSequence.length ; outerIdx ++ ) {
  let isMatch = true; // Optimistically assume a match for the current 'outerIdx' until proven otherwise

  // For each potential starting position, compare characters from the target pattern
  // with the corresponding characters in the main sequence.
  // 'innerOff' tracks the offset within the target pattern.
  for ( let innerOff = 0 ; innerOff < targetPattern.length ; innerOff ++ ) {
    // Check if the character at the current position in the main sequence (outerIdx + innerOff)
    // is different from the character at the current offset in the target pattern (innerOff).
    if ( mainSequence[outerIdx + innerOff] !== targetPattern[innerOff] ) {
      isMatch = false; // A character mismatch means the pattern does not fully match here
      break; // Terminate this inner comparison loop as no full match is possible from 'outerIdx'
    }
  }

  // After the inner loop completes (either by matching all characters or breaking early),
  // if 'isMatch' is still true, it signifies a complete match of the target pattern
  // starting at the 'outerIdx' position in the main sequence.
  if ( isMatch ) {
    foundPositions += outerIdx + "\n"; // Append the successful starting index, followed by a newline
  }
}

// Once all possible starting positions in the main sequence have been checked,
// evaluate if any pattern matches were recorded.
if ( foundPositions !== "" ) {
  // If 'foundPositions' contains any indices, print the accumulated string to the console.
  // The .trim() method ensures any trailing newline character (from the last appended index) is removed.
  console.log( foundPositions.trim() );
}