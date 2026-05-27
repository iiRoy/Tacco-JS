function processInput(dataArray) {
  let valA, valB, valN; // Declare variables for the three input numbers.

  // Parse the first line of the input array.
  // It's trimmed, split by spaces, and each part is converted to an integer.
  [valA, valB, valN] = dataArray[0].trim().split(" ").map(item => parseInt(item, 10));

  // Initialize a variable to store the maximum value found.
  // A very small number is used to ensure any valid calculation will be greater.
  let greatestValue = -100000000;

  // Check if the third number (valN) is greater than the second number (valB).
  if (valN > valB) {
    // If valN is greater, iterate through a specific range to find the maximum.
    // The loop runs from (valN - valB - 1) up to valN, inclusive.
    for (let idx = valN - (valB + 1); idx <= valN; idx++) {
      // Calculate the current result using the given mathematical expression.
      let currentResult = Math.floor(valA * idx / valB) - (valA * Math.floor(idx / valB));

      // If the current result is greater than the stored maximum, update the maximum.
      if (greatestValue < currentResult) {
        greatestValue = currentResult;
      }
    }
  } else {
    // If valN is not greater than valB, calculate the result directly using valN.
    greatestValue = Math.floor(valA * valN / valB) - (valA * Math.floor(valN / valB));
  }

  // Print the final calculated maximum value to the console.
  console.log(greatestValue);
}

// Read input from standard input, process it, and pass it to the main function.
// The input is read as UTF-8, trimmed of leading/trailing whitespace, and split into lines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
