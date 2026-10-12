function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  let inputLines = rawData.split("\n");

  // Parse the first line for the array size
  let arraySize = parseInt(inputLines[0], 10);
  // Get the second line as the initial string
  let initialString = inputLines[1];
  // Parse the third line for the number of queries
  let numQueries = parseInt(inputLines[2], 10);

  // Determine the starting index for query lines
  let queryStartIndex = 3;
  // Array to hold parsed queries
  let queryList = [];
  // Array to hold characters of the string, allowing modifications
  let charArray = [];

  // Populate the character array from the initial string
  for (let idx = 0; idx < arraySize; idx++) {
    charArray.push(initialString[idx]);
  }

  // Read all query lines into the query list
  for (let idx = 0; idx < numQueries; idx++) {
    queryList[idx] = inputLines[queryStartIndex + idx];
  }

  // Process each query in the list
  for (let currentQuery of queryList) {
    // Split the current query string by space to get its components
    let queryParts = currentQuery.split(" ");
    // Parse the first part as the query type
    let queryType = parseInt(queryParts[0], 10);

    // Use a switch statement to handle different query types
    switch (queryType) {
      case 1: // Type 1: Update a character at a specific index
        let targetIndex = parseInt(queryParts[1], 10); // Get the 1-based index
        let newChar = queryParts[2]; // Get the new character

        // Update the character in the array if it's different
        if (charArray[targetIndex - 1] !== newChar) {
          charArray[targetIndex - 1] = newChar;
        }
        break;

      case 2: // Type 2: Count distinct characters in a given range
        let leftBound = parseInt(queryParts[1], 10); // Get the left boundary (1-based)
        let rightBound = parseInt(queryParts[2], 10); // Get the right boundary (1-based)
        let distinctCharsMap = {}; // Object to store distinct characters encountered

        // Check for a valid range before processing
        if (leftBound <= rightBound && leftBound <= arraySize) {
          // Iterate through the specified range
          for (let currentPos = leftBound; currentPos <= rightBound; currentPos++) {
            // Add the character to the map; value doesn't matter, only the key
            distinctCharsMap[charArray[currentPos - 1]] = undefined;
          }
        }
        // Get the number of unique keys (distinct characters)
        let uniqueCount = Object.keys(distinctCharsMap).length;
        // Print the count of distinct characters followed by a newline
        console.log("%d\n", uniqueCount);
        break;

      default: // Default case: Do nothing for unknown query types
        break;
    }
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
