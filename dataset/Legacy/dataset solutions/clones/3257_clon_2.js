'use strict';

function ProcessInput(rawData) {
  // Split the entire input string into an array of lines.
  const dataRows = rawData.split('\n');

  // Parse the first line to get the total number of elements.
  // Although 'itemCount' is not directly used in the core logic, it's part of the input structure.
  const itemCount = parseInt(dataRows[0], 10);

  // Process the second line: split by space and convert each part to a number.
  const heightsArray = dataRows[1].split(' ').map(Number);

  // Initialize a variable to keep track of the height of the preceding element.
  let previousHeight = 0;

  // Initialize a cumulative counter for the total additions required.
  let totalAddedFlowers = 0;

  // Iterate through each height value in the processed array.
  heightsArray.forEach(currentHeight => {
    // If the current element's height is less than the previous one,
    // it implies a "reset" or a decrease, so no additions are made for this step.
    // The 'previousHeight' is simply updated to the current value.
    if (currentHeight < previousHeight) {
      previousHeight = currentHeight;
      return; // Move to the next element in the array.
    }

    // If the current element's height is greater than or equal to the previous one,
    // calculate the difference and add it to the running total.
    // This difference represents the number of units "added" to reach the current height.
    totalAddedFlowers += currentHeight - previousHeight;

    // Update the 'previousHeight' to the current element's height for the subsequent comparison.
    previousHeight = currentHeight;
  });

  // Output the final calculated sum of all additions.
  console.log(totalAddedFlowers);
}

// Read the input from standard input using Node.js 'fs' module
// and then invoke the main processing function with the obtained data.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
