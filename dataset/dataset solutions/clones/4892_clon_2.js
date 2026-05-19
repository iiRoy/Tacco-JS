console.log(( (inputData) => {
  // The input string is processed to extract the number N, and two strings, stringA and stringB.
  const [ firstLineStr, stringA, stringB ] = inputData.trim().split`\n`;
  // Convert the string representation of N into an actual integer value.
  const numChars = firstLineStr | 0;

  // This outer iteration attempts to find an overlap between a suffix of stringA and a prefix of stringB.
  OuterLoop: for ( let outerIndex = 0; outerIndex < numChars; outerIndex++ ) {
    // The inner iteration compares characters for a potential match.
    for ( let innerIndex = 0; outerIndex + innerIndex < numChars; innerIndex++ ) {
      // If a mismatch is found, this particular overlap attempt is invalid.
      if ( stringA[outerIndex + innerIndex] !== stringB[innerIndex] ) {
        continue OuterLoop; // Proceed to the next possible starting point for stringA's suffix.
      }
    }
    // If the inner loop completes without a 'continue OuterLoop', a valid overlap has been identified.
    // The result is the total length of the combined string, which is N plus the starting index of the overlap.
    return outerIndex + numChars;
  }

  // If no overlap is found after checking all possibilities, the total length is simply N + N.
  return numChars + numChars;
} )( require('fs').readFileSync('/dev/stdin', 'utf8') ) );
