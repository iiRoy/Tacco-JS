"use strict";

function processInput(rawData) {
  // This function takes raw string input and processes it
  // according to the problem's requirements.
  let parsedData = rawData.split(/\n/).map(elementStr => elementStr.split(" ").map(valStr => ~~valStr));

  const itemCount = parsedData[0][0]; // The number of items, N
  const thresholdVal = parsedData[1][0]; // The threshold value, K
  const itemValues = parsedData[2]; // The array of item values (balls)

  let totalDistance = 0x0; // Initialize the accumulator for the final result

  // Iterate through each item to calculate its contribution to the total.
  for (let idx = 0; idx < itemCount; idx++) {
    const currentItem = itemValues[idx]; // Get the current item's value
    const distanceToOrigin = currentItem; // Distance from current item to 0
    const distanceToThreshold = Math.abs(currentItem - thresholdVal); // Distance from current item to K

    // Add the minimum of the two distances to the running total.
    totalDistance += (distanceToOrigin < distanceToThreshold) ? distanceToOrigin : distanceToThreshold;
  }

  // Multiply the accumulated distance by two as per the problem's specific rule.
  totalDistance *= 0b10; // This is equivalent to multiplying by 2

  console.log(totalDistance); // Output the final calculated total distance
}

// Read the input from standard input and invoke the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
