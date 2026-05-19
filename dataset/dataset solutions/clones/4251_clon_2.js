function ProcessInput(rawData) {
  // Clean and split the raw input into an array of lines.
  var linesArray = rawData.trim().split('\n');

  // Check for a specific character pattern across the first two lines.
  // The condition checks if:
  // - The first character of the first line matches the third character of the second line.
  // - The first character of the second line matches the third character of the first line.
  // - The second character of the first line matches the second character of the second line.
  if (
    linesArray[0][0] === linesArray[1][2] &&
    linesArray[1][0] === linesArray[0][2] &&
    linesArray[0][1] === linesArray[1][1]
  ) {
    console.log('YES'); // Output 'YES' if the pattern matches.
  } else {
    console.log('NO'); // Output 'NO' otherwise.
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
