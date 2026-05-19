// This module processes incoming textual data.
function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  let processedLines = rawData.split("\n");

  // Extract the first line which contains initial parameters.
  let lineParts = processedLines[0].split(" ");

  // Assign the first and second values from the initial line.
  const firstVal = lineParts[0];
  const secondVal = lineParts[1];

  // Initialize arrays to store left and right boundary values.
  let leftBounds = new Array(secondVal);
  let rightBounds = new Array(secondVal);

  // Iterate through the subsequent lines to populate the bounds arrays.
  for (let idx = 0; idx < secondVal; idx++) {
    lineParts = processedLines[idx + 1].split(" ");
    leftBounds[idx] = lineParts[0];
    rightBounds[idx] = lineParts[1];
  }

  // Initialize maximum and minimum limits with the first elements of the respective arrays.
  let maximumLimit = leftBounds[0];
  let minimumLimit = rightBounds[0];

  // Iterate through the left bounds to find the overall maximum left boundary.
  leftBounds.forEach((currentVal, pos) => {
    if (currentVal > maximumLimit) {
      maximumLimit = currentVal;
    }
  });

  // Iterate through the right bounds to find the overall minimum right boundary.
  rightBounds.forEach((currentVal, pos) => {
    if (currentVal < minimumLimit) {
      minimumLimit = currentVal;
    }
  });

  // Calculate and display the final result based on the determined limits.
  console.log(minimumLimit - maximumLimit + 1);
}

// Execute the main processing function with data read from a file.
// ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
ProcessInput(require("fs").readFileSync("./inputdata.txt", "utf8"));
