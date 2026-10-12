function processEntry(incomingData) {
  // Display the concatenated string to the console.
  console.log("ABC" + incomingData);
}

// Read data from standard input and pass it to the processing function.
processEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
