var processInput = rawData => {
  // This function processes the raw input string to extract necessary data.
  var parsedLines = rawData.split("\n").map(function(lineContent) {
    // Each line from the input is returned as is.
    return lineContent;
  });

  // The first line typically contains a numerical value, here named countVal.
  var countVal = parsedLines[0];
  // The second line contains the character sequence to be analyzed, named charSequence.
  var charSequence = parsedLines[1];

  // Initialize counters for specific character types.
  var periodCount = 0; // Counter for '.' characters.
  var hashCount = 0; // Counter for '#' characters.

  // Iterate through the character sequence based on the countVal.
  // The loop runs from index 0 up to and including the value of countVal.
  for (var idx = 0; idx <= countVal; idx++) {
    // Check the character at the current index.
    if (charSequence[idx] === ".") {
      // If the character is a period, increment its counter.
      periodCount += 1;
    } else if (charSequence[idx] === "#") {
      // If the character is a hash, increment its counter.
      hashCount += 1;
    }
  }

  // Compare the final counts and output the smaller one.
  if (periodCount > hashCount) {
    // If periods are more numerous, print the hash count.
    console.log(hashCount);
  } else {
    // Otherwise (if hashes are more numerous or equal), print the period count.
    console.log(periodCount);
  }
};

// The program starts by reading input from standard input.
// The 'fs' module is used to read the file synchronously.
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
