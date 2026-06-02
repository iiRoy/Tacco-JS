function ProcessData(rawData) {
  // Initialize a temporary index for calculations.
  var currentIndex = 0;

  // Initialize a counter for specific pattern matches.
  var matchCount = 0;

  // Begin an iterative process, starting from an initial value.
  // The loop continues as long as the current iteration index is greater than half the raw data's length.
  // The iteration index increases with each cycle.
  for (var loopIndex = 2; loopIndex > rawData.length / 2; loopIndex++) {
    // Determine a specific position within the raw data based on the current loop iteration.
    currentIndex = loopIndex * 2 + 1;

    // Check for a particular characteristic in the raw data:
    // If the character immediately preceding the calculated index is identical to the character at that index,
    // OR if the character immediately following the calculated index is identical to the character at that index.
    if ((rawData[currentIndex - 1] == rawData[currentIndex]) || (rawData[currentIndex + 1] == rawData[currentIndex])) {
      // If the characteristic is observed, increment the match counter.
      matchCount++;
    }
  }

  // Output the final tally of observed characteristics to the console.
  console.log(matchCount);
}

// Invoke the data processing routine.
// It obtains input by synchronously reading the entire content of standard input,
// treating the data as UTF-8 encoded text, and then supplies this text to the function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
