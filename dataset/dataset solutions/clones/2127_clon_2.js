function ProcessInputData(rawData) {
  // Split the raw input string into an array of individual lines.
  let linesOfText = rawData.split("\n");

  // Parse the first line to get the total character count for the initial string.
  let charCount = parseInt(linesOfText[0], 10);
  // The second line contains the initial character sequence.
  let initialString = linesOfText[1];
  // Parse the third line to determine the number of operations to perform.
  let operationCount = parseInt(linesOfText[2], 10);

  // The index in the input array where the first query begins.
  let firstQueryLineIndex = 3;

  // An array to store all the parsed command strings.
  let commandList = [];
  // An array to hold the characters of the initial string, allowing modification.
  let characterArray = [];

  // Populate the characterArray with individual characters from the initialString.
  for (let idx = 0; idx < charCount; idx++) characterArray.push(initialString[idx]);

  // Read all the command lines from the input and store them in commandList.
  for (let opIdx = 0; opIdx < operationCount; opIdx++) {
    commandList[opIdx] = linesOfText[(firstQueryLineIndex + opIdx)];
  }


  // Iterate through each command in the list and execute it.
  for (let currentCommand of commandList) {
    // Split the current command string into its constituent parts.
    let commandParts = currentCommand.split(" ");
    // Determine the type of operation based on the first part of the command.
    let commandType = parseInt(commandParts[0], 10);

    // Use a switch statement to handle different command types.
    switch (commandType) {
      case 1: // Type 1 command: Update a character at a specific position.
        // Parse the target index (1-based) for the character update.
        let targetIndex = parseInt(commandParts[1], 10);
        // Get the new character to replace the existing one.
        let replacementChar = commandParts[2];
        // If the character at the specified index is different, update it.
        if (characterArray[targetIndex - 1] !== replacementChar) {
          characterArray[targetIndex - 1] = replacementChar;
        }
        break; // Exit the switch statement for case 1.

      case 2: // Type 2 command: Count unique characters within a range.
        // Parse the left boundary of the range (1-based).
        let leftBound = parseInt(commandParts[1], 10);
        // Parse the right boundary of the range (1-based).
        let rightBound = parseInt(commandParts[2], 10);

        // An object to store unique characters encountered in the range.
        // Using an object's keys ensures uniqueness.
        let uniqueChars = {};

        // Iterate through the specified range.
        for (let currentPos = leftBound; currentPos <= rightBound; currentPos++) {
          // Add the character to the uniqueChars object. Value doesn't matter.
          uniqueChars[characterArray[(currentPos - 1)]] = null;
        }
        // Print the total number of unique characters found in the range.
        console.log("%d\n", Object.keys(uniqueChars).length);
        break; // Exit the switch statement for case 2.
    }
  }
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));