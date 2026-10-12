function ProcessInput(rawData) {
  // The raw input string is first split into an array of lines.
  rawData = rawData.split("\n");

  // We are interested in the very first line of the input.
  const targetString = rawData[0];

  // Initialize a variable to keep track of the calculated points.
  var currentPoints = 0;

  // Iterate through each character of the designated string.
  for (var idx = 0; idx < targetString.length; idx++) {
    // If the character at the current index is 'p', decrement the points.
    if (targetString[idx] === "p") {
      currentPoints--;
    }
  }

  // Output the final computed value: half the string's length (integer division) plus the accumulated points.
  console.log(Math.floor(targetString.length / 2) + currentPoints);
}

// This section handles reading input from the standard input stream and invoking the primary processing function.
// It is typically left untouched to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
