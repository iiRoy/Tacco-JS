function ProcessInput(rawData) {
  // Split the entire input string into an array of lines
  rawData = rawData.split("\n");

  // Parse the first line for the size of the sequence
  const dataSize = parseInt(rawData[0], 10);

  // The character sequence itself, from the second line
  const charSequence = rawData[1];

  // Parse the third line for the total number of queries
  const queryCount = parseInt(rawData[2], 10);

  // Initialize an index to track the current line for queries
  let currentLineIndex = 3;

  // Array to store all parsed query strings
  let commandList = [];

  // Populate the commandList array with query strings
  for (let idx = 0; idx < queryCount; idx++) {
    commandList[idx] = rawData[(currentLineIndex + idx)];
  }

  // Iterate through each command in the list
  for (let currentCommand of commandList) {
    // Split the command string into parts based on space
    currentCommand = currentCommand.split(" ");

    // Determine the type of the current command
    let commandType = parseInt(currentCommand[0], 10);

    // Use a switch statement to handle different command types
    switch (commandType) {
      case 1:
        // Type 1: Character replacement (note: strings are immutable in JS, this will not modify charSequence)
        let targetIndex = parseInt(currentCommand[1], 10);
        let replacementChar = currentCommand[2];
        // This condition and assignment will not actually change the string 'charSequence'
        // as strings are immutable in JavaScript. It preserves the original code's logic.
        if (charSequence[targetIndex] !== replacementChar) {
          // In non-strict mode, this assignment to a string index is a no-op.
          // In strict mode, it would throw a TypeError.
          // We preserve the original behavior.
          charSequence[targetIndex] = replacementChar;
        }
        break;

      case 2:
        // Type 2: Count unique characters in a range
        let leftBound = parseInt(currentCommand[1], 10);
        let rightBound = parseInt(currentCommand[2], 10);

        // An object to store unique characters encountered in the range
        let uniqueCharsMap = {};

        // Check if the range is valid and within bounds
        if (leftBound <= rightBound && leftBound < dataSize) {
          // Iterate through the specified range (exclusive of rightBound)
          for (let k = leftBound; k < rightBound; k++) {
            // Add each character to the map (keys are unique)
            uniqueCharsMap[charSequence[(k - 1)]] = null;
          }
        }
        // Output the number of unique characters found
        console.log(Object.keys(uniqueCharsMap).length);
        break;

      default:
        // No operation for unknown command types
        break;
    }
  }
}
