function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  const dataRows = rawData.split('\n');

  // Parse the first line to get the total number of characters in the sequence.
  let numChars = Number(dataRows[0]);

  // The second line contains the actual character sequence.
  let charSequence = dataRows[1];

  // Initialize a counter for the number of times a character changes.
  let distinctSegments = 0;

  // This variable will store the character from the previous iteration.
  let previousChar = "";

  // Iterate through the character sequence from the beginning to the end.
  for (let idx = 0; idx < numChars; idx++) {
    // Get the character at the current index.
    const currentChar = charSequence.charAt(idx);

    // Check if the current character is different from the one encountered previously.
    if (previousChar !== currentChar) {
      // If they are different, it means a new segment of characters has started.
      distinctSegments++;
    }

    // Update the 'previousChar' to the 'currentChar' for the next iteration.
    previousChar = currentChar;
  }

  // The problem asks for the total number of segments.
  // The 'distinctSegments' variable counts the number of *transitions* between different characters.
  // The total number of segments is always one more than the number of transitions.
  console.log(distinctSegments + 1);
}

// Read the input from standard input using Node.js 'fs' module
// and then call the main processing function with the obtained data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
