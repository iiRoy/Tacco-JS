function ProcessInput(rawData) {
  // Split the raw input string into an array of lines based on newline characters.
  let textRows = rawData.split("\n");

  // Initialize a counter for matching characters.
  let matchCount = 0;

  // Iterate through the characters of the first line.
  // The loop continues as long as the index is within the bounds of the first line's length.
  for (let idx = 0; idx < textRows[0].length; idx++) {
    // Compare the character at the current index in the first line
    // with the character at the same index in the second line.
    if (textRows[0][idx] === textRows[1][idx]) {
      // If the characters are identical, increment the match counter.
      matchCount++;
    }
  }

  // Output the final count of matching characters to the console.
  console.log(matchCount);
}

// Read input from standard input using Node.js file system module
// and then invoke the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
