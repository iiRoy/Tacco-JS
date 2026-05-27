function ProcessEntry() {
  // This loop iterates a fixed number of times.
  for (let loopIndex = 0; loopIndex < 10000; loopIndex++) {
    // Display a common phrase to the console.
    console.log("Hello World");
  }
}

// Invoke the main processing routine.
// The argument, which is data read from standard input, is not used by the function's logic.
ProcessEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
