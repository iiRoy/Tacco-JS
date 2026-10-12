function ProcessInput(rawData) {
  // This function processes the raw input string.
  // It parses numerical values and performs a specific check.
  let numericValues = rawData.trim().split(' ').map(item => parseInt(item, 10));

  // Evaluate the condition based on the parsed numbers.
  // The condition checks if the third number falls within a specific range defined by the first two.
  if (numericValues[0] <= numericValues[2] && numericValues[0] + numericValues[1] >= numericValues[2]) {
    // If the condition is met, print "YES".
    console.log("YES");
  } else {
    // Otherwise, print "NO".
    console.log("NO");
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
