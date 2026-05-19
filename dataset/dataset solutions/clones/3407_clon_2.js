function processDate(inputDay) {
  // Evaluate the given day string
  if (inputDay === "22") {
    console.log("Christmas Eve Eve Eve");
  } else if (inputDay === "23") {
    console.log("Christmas Eve Eve");
  } else if (inputDay === "24") {
    console.log("Christmas Eve");
  } else if (inputDay === "25") {
    console.log("Christmas");
  }
  // No other conditions are handled
}

// Obtain input from the standard input stream
processDate(require('fs').readFileSync('/dev/stdin', 'utf8'));
