// Function responsible for analyzing a given character string to identify and count changes between adjacent characters.
function ProcessStringDifferences(inputSequence) {
  // Establish the total number of characters within the supplied sequence.
  const sequenceLength = inputSequence.length;

  // Initialize a counter to track the occurrences of differing adjacent characters.
  let differenceCount = 0;

  // Store the very first character of the sequence for initial comparison.
  let lastCharacter = inputSequence[0];

  // Commence iteration from the second character, proceeding through the entire sequence.
  for (let currentIndex = 1; currentIndex < sequenceLength; ++currentIndex) {
    // Evaluate if the character at the current position is distinct from the character previously noted.
    if (inputSequence[currentIndex] !== lastCharacter) {
      // If a dissimilarity is detected, increment the running count of differences.
      differenceCount++;
      // Update the reference character to the current one for subsequent comparisons.
      lastCharacter = inputSequence[currentIndex];
    }
  }

  // Invoke a utility to present the final calculated tally of differences.
  displayFinalResult(differenceCount);
}


// A helper function designed to output a numerical value to the console.
const displayFinalResult = (numericValue) => {
  console.log(numericValue);
};


// A dedicated utility function to securely retrieve the program's input from standard input stream.
const obtainProgramInput = () => {
  // Leverages the Node.js file system module to synchronously read from /dev/stdin.
  // The input data is decoded as 'utf8' and any leading or trailing whitespace characters are removed.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};


// The primary execution pathway: first, acquire the necessary input,
// then pass it to the core processing function.
ProcessStringDifferences(obtainProgramInput());