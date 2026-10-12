(function (inputData) {
  // Process the raw input string by splitting it into individual lines.
  var linesOfText = inputData.split("\n");

  // Parse the first line to determine the count of elements.
  var elementCount = parseInt(linesOfText[0], 0xA);

  // Split the second line into an array of string representations of numbers.
  var numericStrings = linesOfText[0x1].split(" ");

  // Initialize a counter for the result.
  var resultCounter = 0x0;

  // Flags to track ascending and descending trends.
  var isAscending = false;
  var isDescending = false;

  // Iterate through the array of numeric strings, comparing adjacent elements.
  for (var idx = 0x0; idx < elementCount - 0x1; idx++) {
    // Check if the current element is less than the next one.
    if (numericStrings[idx] < numericStrings[idx + 0x1]) {
      isAscending = true; // Mark an ascending trend.
    }

    // Check if the current element is greater than the next one.
    if (numericStrings[idx] > numericStrings[idx + 0x1]) {
      isDescending = true; // Mark a descending trend.
    }

    // If both an ascending and a descending trend have been observed,
    // it signifies a "peak" or "valley" pattern.
    if (isAscending && isDescending) {
      // Reset the flags for the next segment.
      isAscending = false;
      isDescending = false;
      // Increment the result counter.
      resultCounter++;
    }
  }

  // Output the final calculated result to the console.
  console.log("%d", resultCounter);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
