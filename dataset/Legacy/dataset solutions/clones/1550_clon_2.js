function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split("\n");

  // Extract the first line and convert it into an array of characters.
  var firstSequence = rawData[0].split("");
  // Extract the second line and convert it into an array of characters.
  var secondPattern = rawData[1].split("");

  // Initialize a variable to store the minimum number of mismatches found.
  // A large initial value ensures the first comparison will update it.
  var minimumMismatches = 1001;

  // Iterate through possible starting positions in the 'firstSequence'.
  // The loop runs until 'secondPattern' can no longer fit entirely within 'firstSequence'.
  for (
    var outerIndex = 0;
    outerIndex < firstSequence.length - secondPattern.length + 1;
    outerIndex++
  ) {
    // Initialize a counter for mismatches in the current comparison window.
    var currentMismatches = 0;

    // Iterate through the characters of 'secondPattern' to compare with the current segment of 'firstSequence'.
    for (var innerOffset = 0; innerOffset < secondPattern.length; innerOffset++) {
      // Check if the character in 'firstSequence' at the current position
      // does not match the character in 'secondPattern'.
      if (firstSequence[outerIndex + innerOffset] !== secondPattern[innerOffset]) {
        // If there's a mismatch, increment the mismatch counter.
        currentMismatches = ++currentMismatches;
      } else {
        // Characters match, do nothing.
      }
    }

    // After comparing the current segment, check if the number of mismatches
    // is less than the previously recorded minimum.
    if (minimumMismatches > currentMismatches) {
      // If it is, update the minimum mismatches.
      minimumMismatches = currentMismatches;
    } else {
      // Otherwise, keep the existing minimum.
    }
  }

  // Output the final minimum number of mismatches to the console.
  console.log(minimumMismatches);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
