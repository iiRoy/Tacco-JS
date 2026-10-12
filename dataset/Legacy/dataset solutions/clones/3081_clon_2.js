function analyzeColors(rawData) {
  // Initialize counters for different color types.
  let redCount = 0, blueCount = 0;

  // Split the raw input string into an array of lines.
  const linesOfInput = rawData.split('\n');

  // Parse the first line to determine the number of elements (though not directly used in the logic).
  numElements = parseInt(linesOfInput[0].replace(/\r?\n/g, ''));

  // Extract the second line, remove any newline characters, and split it into individual characters.
  charSequence = linesOfInput[1].replace(/\r?\n/g, '').split('');

  // Iterate over each character in the sequence.
  charSequence.forEach((currentColor) => {
    // Check if the current character represents 'R'.
    if (currentColor === 'R') {
      redCount++; // Increment the counter for 'R'.
    } else {
      // Otherwise, assume it represents 'B' and increment its counter.
      blueCount++;
    }
  });

  // Compare the final counts of 'R' and 'B'.
  if (redCount > blueCount) {
    console.log("Yes"); // Output "Yes" if 'R' count is greater.
  } else {
    console.log("No"); // Output "No" otherwise.
  }
}

// Read input from standard input and pass it to the analysis function.
analyzeColors(require("fs").readFileSync("/dev/stdin", "utf8"));
