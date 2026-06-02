function ProcessInput(rawData) {
  // Split the raw input data into individual lines.
  var lines = rawData.split('\n');

  // Extract the first numeric value and convert it to an integer.
  var countVal = Math.floor(lines[0]);
  // Get the second line as the string to be processed.
  var targetString = lines[1];

  // Initialize a counter for the occurrences of the target sequence.
  var occurrenceCount = 0;

  // Iterate through the string, checking for the 'ABC' sequence.
  // The loop runs up to 'countVal - 2' to ensure there are enough characters
  // for 'str[idx]', 'str[idx + 1]', and 'str[idx + 2]'.
  for (var idx = 0; idx < countVal - 2; idx++) {
    // Check if the current character is 'A'.
    if (targetString[idx] === 'A') {
      // If 'A' is found, check if the next character is 'B'.
      if (targetString[idx + 1] === 'B') {
        // If 'B' is found, check if the character after that is 'C'.
        if (targetString[idx + 2] === 'C') {
          // If 'ABC' sequence is found, increment the counter.
          occurrenceCount++;
        }
      }
    }
  }

  // Output the total number of 'ABC' occurrences found.
  console.log(occurrenceCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
