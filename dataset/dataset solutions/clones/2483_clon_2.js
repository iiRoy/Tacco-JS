function ProcessData(rawData) {
  // Parse the input data by splitting it into lines
  rawData = rawData.split("\n");

  // Remove the last line if it's empty, common for some input methods
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Extract the number of elements and maximum allowed operations
  const countElements = Number(rawData[0].split(' ')[0]);
  const maxOperations = Number(rawData[0].split(' ')[1]);

  // Process the first list: convert to numbers and sort ascending
  var firstList = rawData[1]
    .split(' ')
    .map(itemStr => {
      return Number(itemStr);
    })
    .sort((val1, val2) => {
      return val1 - val2;
    });

  // Process the second list: convert to numbers and sort descending
  var secondList = rawData[2]
    .split(' ')
    .map(elementStr => {
      return Number(elementStr);
    })
    .sort((valueA, valueB) => {
      return valueB - valueA;
    });

  // Initialize a variable to store the maximum possible product found so far
  var currentMaxProduct = 0;
  for (var idx = 0; idx < countElements; idx++) {
    currentMaxProduct = Math.max(currentMaxProduct, firstList[idx] * secondList[idx]);
  }

  // Perform a binary search to find the minimum possible maximum product after adjustments
  var currentMinProduct = -1; // Represents an impossible (too low) product
  var midpointValue;         // Variable to hold the middle value in the search range
  var totalAdjustments;      // Accumulator for required adjustments

  // Continue the search while the range of possible products is greater than 1
  while (currentMaxProduct - currentMinProduct > 1) {
    // Calculate the midpoint value using Math.ceil to favor higher values
    midpointValue = Math.ceil((currentMinProduct + currentMaxProduct) / 2);
    totalAdjustments = 0; // Reset adjustment count for each midpoint check

    // Calculate total adjustments needed to achieve 'midpointValue' as max product
    for (var indexVal = 0; indexVal < countElements; indexVal++) {
      totalAdjustments += Math.max(0, firstList[indexVal] - Math.floor(midpointValue / secondList[indexVal]));
    }

    // Adjust the search range based on whether the total adjustments are within limits
    if (totalAdjustments <= maxOperations) {
      currentMaxProduct = midpointValue; // It's possible, try for a smaller max product
    } else {
      currentMinProduct = midpointValue; // Not possible, need a larger max product
    }
  }

  // Output the final minimum possible maximum product
  console.log(currentMaxProduct);
}


// The following section handles standard input/output operations.
// Do not modify this part of the script.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));