let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input
let lineSegments = rawData.trim().split("\n"); // Process raw data: remove whitespace, then split into an array of lines

while (true) { // Begin main processing loop, continues until a specific condition is met
  let itemCount = lineSegments.shift() - 0; // Extract the first line, convert to a number (N), representing the count of items
  if (itemCount === 0) break; // If the item count is zero, terminate the main processing loop

  let statusIndicator = "OK"; // Initialize a status flag for the current block of data
  let dataMatrix = []; // Create an empty array to store parsed data rows

  // Loop to populate the data matrix with 'itemCount' number of rows
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    let currentLineValues = lineSegments.shift().split(" ").map(Number); // Take the next line, split by space, and convert parts to numbers
    dataMatrix.push(currentLineValues); // Add the array of numbers to our data matrix
  }

  statusIndicator = "OK"; // Re-initialize the status indicator (this line is structurally preserved from the original)

  // Outer loop to iterate through each item in the data matrix
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    if (statusIndicator === "NG") break; // If the status is already 'NG', no need to perform further checks for this block

    let currentWeight = dataMatrix[outerIndex][0]; // Extract the first value (weight) of the current item
    let startRange = dataMatrix[outerIndex][1]; // Extract the second value (start range) of the current item
    let endRange = dataMatrix[outerIndex][2]; // Extract the third value (end range) of the current item

    // Inner loop to compare the current item with all other items in the data matrix
    for (let innerIndex = 0; innerIndex < itemCount; innerIndex++) {
      if (outerIndex === innerIndex) continue; // Skip comparison if it's the same item

      let otherWeight = dataMatrix[innerIndex][0]; // Extract weight of the other item
      let otherStart = dataMatrix[innerIndex][1]; // Extract start range of the other item
      let otherEnd = dataMatrix[innerIndex][2]; // Extract end range of the other item

      // Check for a specific overlap condition between the current item's range and the other item's range
      if (endRange <= otherStart && startRange <= otherEnd) {
        currentWeight += otherWeight; // If condition met, add the other item's weight to the current item's accumulated weight
      }

      // Check if the accumulated weight exceeds a predefined limit
      if (currentWeight > 150) {
        statusIndicator = "NG"; // If the limit is exceeded, set the status indicator to 'NG'
      }
    }
  }
  console.log(statusIndicator); // Output the final status for the current block of data
}
