(function(rawData){
  // Process the raw input data, splitting it into individual lines
  let linesOfText = rawData.split('\n');

  // Parse the first line to get the total number of elements
  let countElements = Number.parseInt(linesOfText[0], 10);

  // Split the second line into an array of strings, representing the sequence
  let numberSequence = linesOfText[1].split(' ');

  // Initialize a counter for the identified patterns
  let resultCounter = 0;

  // Flags to track if an increasing or decreasing trend has been observed
  let isIncreasing = false;
  let isDecreasing = false;

  // Iterate through the sequence, comparing adjacent elements
  // The loop runs up to the second-to-last element to allow comparison with the next one
  for (let currentIdx = 0; currentIdx < countElements - 1; currentIdx++) {
    // Check if the current element is less than the next one (increasing trend)
    if (numberSequence[currentIdx] < numberSequence[currentIdx + 1]) {
      isIncreasing = true; // Mark that an increase has been detected
    }

    // Check if the current element is greater than the next one (decreasing trend)
    if (numberSequence[currentIdx] > numberSequence[currentIdx + 1]) {
      isDecreasing = true; // Mark that a decrease has been detected
    }

    // If both an increasing and decreasing trend have been observed
    // since the last reset, it signifies a complete "zig-zag" pattern
    if (isIncreasing && isDecreasing) {
      isIncreasing = isDecreasing = false; // Reset the flags for the next pattern search
      resultCounter++;                     // Increment the pattern counter
    }
  }

  // Output the final count of detected patterns
  console.log("%d", resultCounter);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));