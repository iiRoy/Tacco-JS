console.log((inputData => {
  // Prepare the input string by removing any leading or trailing whitespace.
  const cleanedString = inputData.trim();
  // Determine the index of the final character in the string.
  const finalCharIndex = cleanedString.length - 1;
  // Initialize a counter for necessary character adjustments.
  let adjustmentTally = 0;

  // Traverse the string using two pointers, one starting from the beginning and one from the end.
  for (let leftCursor = 0, rightCursor = finalCharIndex; leftCursor < rightCursor; leftCursor++, rightCursor--) {
    // Continue looping as long as the characters at the current pointers do not match.
    while (cleanedString[leftCursor] !== cleanedString[rightCursor]) {
      // If the character at the left cursor is 'x', increment the tally and advance the left cursor.
      if (cleanedString[leftCursor] === 'x') {
        adjustmentTally++;
        leftCursor++;
      }
      // Otherwise, if the character at the right cursor is 'x', increment the tally and retreat the right cursor.
      else if (cleanedString[rightCursor] === 'x') {
        adjustmentTally++;
        rightCursor--;
      }
      // If neither character is 'x', it's impossible to make them match, so return an error indicator.
      else {
        return '-1';
      }
    }
  }
  // After the loop completes, return the total count of adjustments as a string.
  return `${adjustmentTally}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
