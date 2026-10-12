process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8

// Event listener for incoming data chunks from standard input
process.stdin.on('data', function(inputChunk) {
  // Split the entire input chunk into an array of individual lines
  const inputLines = inputChunk.split("\n");

  // The first line contains the total number of test cases (N)
  // Convert the string to a number using multiplication
  let numCases = inputLines[0] * 1;

  // The second line holds the specific string we are looking for
  const targetString = inputLines[1];

  // Declare variables for loop iteration and string length
  let caseIndex, charIndex, targetLength;
  
  // Initialize a counter for how many times the target string is found
  let matchCount = 0;

  // Iterate through each test case, starting from the third line (index 2)
  // The loop runs for 'numCases' iterations
  for (caseIndex = 2; caseIndex < numCases + 2; caseIndex++) {
    // Convert the target string into an array of characters for easy access
    const targetChars = targetString.split('');
    
    // Get the current board string for the present test case
    const currentBoard = inputLines[caseIndex];
    
    // Declare variables for calculating board index, step size, and a flag for match status
    let boardIndex, stepSize;
    let foundMatch = false; // This flag tracks if a match is found for the current 'currentBoard'

    // Determine the total length of the current board string
    const boardLength = currentBoard.length;

    // Outer loop: Iterate through all possible 'stepSize' values
    // 'stepSize' dictates the pattern of character selection from 'currentBoard'
    for (stepSize = 0; stepSize < boardLength; stepSize++) {
      // Get the length of the target character array
      targetLength = targetChars.length;

      // Inner loop: Iterate through each character of the 'targetChars' array
      for (charIndex = 0; charIndex < targetLength; charIndex++) {
        // Calculate the corresponding index in the 'currentBoard' based on 'charIndex' and 'stepSize'
        boardIndex = charIndex + stepSize * charIndex;

        // Check if the character at 'boardIndex' in 'currentBoard' matches the 'charIndex' character in 'targetChars'
        // Also, verify if this is the last character of the 'targetChars' array
        if (currentBoard[boardIndex] === targetChars[charIndex] && charIndex === targetLength - 1) {
          foundMatch = true; // A complete match for the target string has been identified
          break;            // Exit the inner loop as we've found our match
        }
      }
      
      // If a match was found in the inner loop, there's no need to try other 'stepSize' values
      if (foundMatch) {
        break; // Exit the outer loop
      }
    }

    // If 'foundMatch' is true for the current 'currentBoard', increment the global match counter
    if (foundMatch) {
      matchCount++;
    }
  }

  // Print the final total count of boards where the target string was successfully found
  console.log(matchCount);
});
