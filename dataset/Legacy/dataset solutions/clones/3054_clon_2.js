function ProcessInput(rawData) {
  // Initialize a variable to hold the original total length of the input string.
  var originalTotalLength = rawData.length;
  // Declare a variable for the length of the current processed segment.
  var currentSegmentLength;
  // Declare a variable to store characters of the current segment.
  var segmentChars;
  // Initialize the alternating pattern value (starts with 0, then 1, then 0, etc.).
  var expectedPattern = 0;
  // Initialize the variable that will store the final calculated result.
  var finalResult = 0;
  // Initialize a counter for elements that match the expected alternating pattern.
  var matchCounter = 0;
  // A flag to control the main processing loop; 0 means continue, 1 means stop.
  var processingComplete = 0;
  // Declare an array to store the numeric representation of the current segment's characters.
  var numericSegment;
  // Define the fixed size of each chunk to be processed from the input.
  var chunkSize = 10;
  // Declare a loop index variable.
  var idx;

  // The main loop continues as long as there's data to process (processingComplete is 0).
  while (processingComplete === 0) {
    // Extract a portion of the rawData string, up to chunkSize, and split it into an array of characters.
    segmentChars = rawData.substring(0, chunkSize).split("");
    // Update the current segment's length based on the extracted chunk.
    currentSegmentLength = segmentChars.length;
    // Create a new array to hold the integer values of the characters in the current segment.
    numericSegment = new Array(currentSegmentLength);

    // Iterate through the characters of the current segment.
    for (idx = 0; idx < currentSegmentLength; idx++) {
      // Convert each character to an integer and store it in the numericSegment array.
      numericSegment[idx] = parseInt(segmentChars[idx], 10);
    }

    // Iterate through the numeric segment to compare with the alternating pattern.
    for (idx = 0; idx < currentSegmentLength; idx++) {
      // If the current numeric value matches the expected pattern, increment the match counter.
      if (numericSegment[idx] === expectedPattern) {
        matchCounter++;
      }
      // Toggle the expected pattern for the next comparison (0 becomes 1, 1 becomes 0).
      expectedPattern = (expectedPattern + 1) % 2;
    }

    // Check if there is still more rawData left to process after the current chunk.
    if (rawData.length > chunkSize) {
      // If yes, remove the processed chunk from the beginning of rawData.
      rawData = rawData.slice(chunkSize);
    } else {
      // If no, set the flag to indicate that all input has been processed, ending the loop.
      processingComplete = 1;
    }
  }

  // After processing all chunks, calculate the final result.
  // The result is the minimum number of flips required to make the entire sequence
  // either match the alternating pattern or its inverse.
  if (originalTotalLength - matchCounter > matchCounter) {
    finalResult = matchCounter;
  } else {
    finalResult = originalTotalLength - matchCounter;
  }

  // Output the final calculated result to the console.
  console.log(finalResult);
}

// Read the input from standard input using Node.js file system module
// and then call the main processing function with the read data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
