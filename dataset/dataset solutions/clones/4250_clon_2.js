const processInputData = (sourceText) => {
  // Clean up the raw input and split it into an array of lines
  const lineArray = sourceText.trim().split('\n');

  // Iterate through the first three characters to perform a comparison
  for (let currentIdx = 0; currentIdx < 3; currentIdx++) {
    // Compare the character at currentIdx in the first line
    // with the character at (2 - currentIdx) in the second line.
    // This effectively checks if the first line is the reverse of the second line
    // for the first three characters.
    if (lineArray[0].charAt(currentIdx) !== lineArray[1].charAt(3 - 1 - currentIdx)) {
      // If a mismatch is found, print 'NO' and terminate execution
      console.log('NO');
      return;
    }
  }

  // If the loop completes without any mismatches, it means the condition is met
  console.log('YES');
};

// Read input from standard input and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
