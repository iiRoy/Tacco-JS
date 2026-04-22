function ProcessData(rawData) {
  // Break down the entire input content into individual string entries.
  var textLines = rawData.split('\n');

  // Extract the numeric value from the first line, indicating string length.
  var numChars = Number(textLines[0]);

  // Obtain the primary sequence of characters for analysis from the second line.
  var targetString = textLines[1];

  // Initialize a counter to track changes in consecutive characters.
  var distinctSegments = 0;

  // Store the character examined in the previous iteration.
  var previousChar = '';

  // Loop through the character sequence for the specified length.
  for (var charIndex = 0; charIndex < numChars; charIndex++) {
    // Retrieve the character at the current position.
    var currentChar = targetString.charAt(charIndex);

    // If the current character differs from the preceding one,
    // it signals a new block of identical characters.
    if (previousChar !== currentChar) {
      distinctSegments++; // Increment the counter for such blocks.
    }

    // Set the current character as the previous one for the subsequent iteration.
    previousChar = currentChar;
  }

  // Output the final count, often incremented by one for problem-specific reasons.
  console.log(distinctSegments + 1);
}

// Invoke the main processing routine with data acquired from the standard input stream.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));