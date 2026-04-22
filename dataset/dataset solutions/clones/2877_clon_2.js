function ProcessInput(rawData) {
  // Initialize the main string after removing leading/trailing whitespace
  var processedString = rawData.trim();
  // Determine the effective length of the string
  var stringLength = processedString.length;

  // Counter for the number of successful transformations
  var transformationCount = 0;

  /* Check if the string is long enough for the operation */
  if (stringLength >= 3) {
    // Iterate through the string, looking for specific patterns
    for (var currentIndex = 0; currentIndex < stringLength - 2; currentIndex++) {
      // Check for the "ABC" sequence
      if (processedString[currentIndex] + processedString[currentIndex + 1] + processedString[currentIndex + 2] === "ABC") {
        // Extract the part of the string before the matched sequence
        var prefixSegment = processedString.slice(0, currentIndex);
        // Extract the part of the string after the matched sequence
        var suffixSegment = processedString.slice(currentIndex + 3);

        // Replace "ABC" with "BCA" and reconstruct the string
        processedString = prefixSegment + "BCA" + suffixSegment;
        // Increment the transformation counter
        transformationCount++;
        // Adjust the loop index to re-evaluate potentially new "ABC" sequences
        // that might have been formed by the transformation
        currentIndex -= 2;
      }
    }
  }
  // Output the final count of transformations
  console.log(transformationCount);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));