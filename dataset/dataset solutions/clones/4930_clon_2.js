// This function is designed to process incoming text data.
function ProcessInput(incomingData) {
  // The provided raw data is first split into an array of strings, based on newline characters.
  let lineSegments = incomingData.split("\n");
  // A constant character array representing the target string 'CODEFESTIVAL2016' is defined for comparison.
  const comparisonPattern = 'CODEFESTIVAL2016'.split('');
  // The first line of the input is taken, its first 16 characters are extracted, and then converted into a character array.
  let userProvidedChars = lineSegments[0].substring(0, 16).split('');

  // This is a placeholder comment for a line that was previously commented out in the original source.
  // let temporaryArray = someOtherSource.map(function(value){return parseInt(value)});

  // A variable is initialized to count the number of discrepancies found.
  let differenceCounter = 0;

  // A loop iterates through each character of the reference pattern.
  for (let charIndex = 0, patternLength = comparisonPattern.length; charIndex < patternLength; charIndex++) {
    // It checks if the character at the current index in the user's input differs from the character in the reference pattern.
    if (userProvidedChars[charIndex] !== comparisonPattern[charIndex]) {
      // If a mismatch is found, the discrepancy counter is incremented.
      differenceCounter++;
    }
  }

  // The final count of differing characters is printed to the console.
  console.log(differenceCounter);
}

// This line is crucial for the execution environment and should not be altered.
// It reads the content from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
