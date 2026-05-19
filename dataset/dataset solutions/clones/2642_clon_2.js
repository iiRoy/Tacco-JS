console.log((inputData => {
  // Process the raw input data: trim whitespace and split by newline to get two strings.
  const [sourceString, targetString] = inputData.trim().split('\n');

  // Determine the lengths of both input strings for efficient access.
  const sourceLength = sourceString.length;
  const targetLength = targetString.length;

  // Initialize variables to track the search progress.
  let lastFoundIndex = -1; // Stores the index in 'sourceString' where the last character of 'targetString' was matched.
  let cycleCount = 0;      // Counts how many full 'sourceString' repetitions have been virtually traversed.

  // Begin the primary iteration: loop through each character of the 'targetString'.
  OuterLoop: for (let targetCharIndex = 0; targetCharIndex < targetLength; targetCharIndex++) {
    // Inner loop: search for the current 'targetString' character within 'sourceString'.
    // The search starts from 'lastFoundIndex + 1' to ensure sequential matching.
    for (let sourceCharIndex = lastFoundIndex + 1; sourceCharIndex < sourceLength; sourceCharIndex++) {
      // If a match is found between the current target character and a source character:
      if (sourceString[sourceCharIndex] === targetString[targetCharIndex]) {
        lastFoundIndex = sourceCharIndex; // Update the last successful match index.
        continue OuterLoop;               // Proceed to the next character in 'targetString'.
      }
    }

    // If the inner loop completes without finding a match (i.e., 'continue OuterLoop' was not executed),
    // it means the current 'targetString' character was not found in the remaining part of the 'sourceString'.

    // Special case: If 'lastFoundIndex' is still -1, it implies the very first character of 'targetString'
    // could not be found in 'sourceString' at all. This makes the task impossible.
    if (lastFoundIndex === -1) {
      return '-1'; // Return the error indicator.
    }

    // If we reach this point, it means we need to "wrap around" or start a new conceptual cycle of 'sourceString'.
    cycleCount++;         // Increment the count of full 'sourceString' cycles.
    lastFoundIndex = -1;  // Reset 'lastFoundIndex' to -1 to search from the beginning of 'sourceString' in the new cycle.
    targetCharIndex--;    // Decrement 'targetCharIndex' to re-evaluate the current 'targetString' character
                          // from the start of the newly conceptualized 'sourceString' cycle.
  }

  // After successfully matching all characters of 'targetString', calculate the final result.
  // The result is the total effective length covered:
  // (number of full cycles * length of sourceString) + (1-based index of the last matched character in the final cycle).
  return `${cycleCount * sourceLength + lastFoundIndex + 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
