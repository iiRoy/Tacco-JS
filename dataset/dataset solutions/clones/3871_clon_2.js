var processInput = function processInput(dataString) {
  // Initialize a counter for specific character occurrences.
  var occurrenceCounter = 0;

  // Loop through each character in the provided string.
  for (var idx = 0; idx < dataString.length; idx++) {
    // If the current character is 'o', increment the counter.
    if (dataString[idx] === 'o') {
      occurrenceCounter++;
    }
  }

  // Output the calculated value to the console.
  console.log(700 + occurrenceCounter * 100);
};

// Read the entire content from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
