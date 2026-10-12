function processInput(rawData) {
  // Extract the initial line from the provided raw data string.
  let firstLine = rawData.split("\n")[0];

  // Evaluate the content of the extracted line.
  if (firstLine === "ABC") {
    // If the line matches "ABC", print "ARC" to the console.
    console.log("ARC");
  } else {
    // Otherwise, print "ABC" to the console.
    console.log("ABC");
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
