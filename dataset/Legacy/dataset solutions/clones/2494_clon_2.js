'use strict';

// This function processes the raw input data to count distinct elements.
function processInput(rawData) {
  // Split the raw input string by newline characters to get individual lines.
  const lineSegments = rawData.split('\n'),
        // The first line contains the total count of items.
        itemCount = lineSegments[0],
        // The second line contains space-separated data elements.
        dataElements = lineSegments[1].split(' ');

  // Initialize a variable to keep track of the number of unique elements.
  let uniqueCount = 0;
  // Initialize a variable to store the last encountered unique element.
  let lastSeenElement = '';

  // Iterate through each element in the dataElements array.
  for (let idx = 0; idx < itemCount; ++idx) {
    // Check if the current element is different from the last seen unique element.
    if (lastSeenElement !== dataElements[idx]) {
      // If it's different, increment the unique count.
      ++uniqueCount;
      // Update the last seen unique element to the current element.
      lastSeenElement = dataElements[idx];
    }
  }

  // Output the final count of unique elements to the console.
  console.log(uniqueCount);
}

// Read the input from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
