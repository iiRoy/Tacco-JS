function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Parse the number of characters in the initial string.
  var charCount = parseInt(rawData[0], 10);
  // Get the initial string itself.
  var initialString = rawData[1];
  // Parse the total number of queries to process.
  var queryCount = parseInt(rawData[2], 10);

  // Determine the starting index for query lines in the input array.
  var queryStartIndex = 3;

  // Initialize an array to store all query strings.
  var operationList = [];
  // Initialize an array to hold individual characters of the string, allowing modification.
  var characterArray = [];

  // Populate the character array from the initial string.
  for (var idx = 0; idx < charCount; idx++) {
    characterArray.push(initialString[idx]);
  }

  // Read all query strings from the input.
  for (var idx = 0; idx < queryCount; idx++) {
    operationList[idx] = rawData[queryStartIndex + idx];
  }

  // Process each query in the list.
  for (var currentOperation of operationList) {
    // Split the current query string into its components.
    currentOperation = currentOperation.split(" ");
    // Determine the type of operation.
    var operationType = parseInt(currentOperation[0], 10);

    // Use a switch statement to handle different operation types.
    switch (operationType) {
      case 1: // Type 1: Character update operation.
        // Parse the 1-based index of the character to update.
        var targetIndex = parseInt(currentOperation[1], 10);
        // Get the new character value.
        var newCharacter = currentOperation[2];
        // Update the character in the array if it's different.
        if (characterArray[targetIndex - 1] !== newCharacter) {
          characterArray[targetIndex - 1] = newCharacter;
        }
        break;

      case 2: // Type 2: Count unique characters in a range operation.
        // Parse the 1-based left boundary of the range.
        var leftBound = parseInt(currentOperation[1], 10);
        // Parse the 1-based right boundary of the range.
        var rightBound = parseInt(currentOperation[2], 10);

        // Use an object to store unique characters encountered in the range.
        var uniqueChars = {};
        // Iterate through the specified range.
        for (leftBound; leftBound <= rightBound; leftBound++) {
          // Add each character as a key to the object; value doesn't matter.
          uniqueChars[characterArray[leftBound - 1]] = null;
        }
        // Print the count of unique characters (number of keys in the object).
        console.log("%d\n", Object.keys(uniqueChars).length);
        break;
    }
  }
}

// Invoke the main processing function with input read from stdin.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
