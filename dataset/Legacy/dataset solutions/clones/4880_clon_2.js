function processInput(rawData) {
  // Divide the incoming data by newline characters.
  let processedLines = rawData.split("\n");

  // Obtain the first line and remove any leading or trailing whitespace.
  const targetString = processedLines[0].trim();

  // Initialize a variable to store the character encountered in the prior iteration.
  let lastChar = targetString[0];

  // Set up a counter for instances where characters differ from their predecessor.
  let changeCount = 0;

  // Traverse the string, beginning from the second character.
  for (let idx = 1; idx < targetString.length; idx++) {
    // Determine if the current character is not identical to the last recorded character.
    if (lastChar !== targetString[idx]) {
      // If a difference is found, increment the change counter.
      changeCount++;
    }
    // Update the 'lastChar' to the character currently being examined for the subsequent loop cycle.
    lastChar = targetString[idx];
  }

  // Display the final tally of character changes to the standard output.
  console.log(changeCount);
}

// This section is responsible for reading input from the standard input stream and invoking the primary processing function.
// It is typically part of the execution environment and should remain unaltered.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
