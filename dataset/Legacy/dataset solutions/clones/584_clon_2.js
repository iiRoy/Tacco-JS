var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Split input into lines, removing leading/trailing whitespace

// Main processing loop
while (true) {
  // Parse the first line of each test case for N and M
  var dimensions = lineSegments.shift().split(" ").map(Number);
  var countA = dimensions[0]; // N: number of elements in the array
  var limitVal = dimensions[1]; // M: the maximum allowed sum

  // If N and M are both zero, terminate the program
  if (countA === 0 && limitVal === 0) {
    break;
  }

  // Initialize an array to store the input numbers
  var valueList = [];
  // Populate the array with N numbers from the input
  for (var idx = 0; idx < countA; idx++) {
    valueList.push(lineSegments.shift() - 0); // Convert string to number
  }
  valueList.push(0); // Add a zero to the end of the list as per problem logic

  // Initialize a list to store all possible sums of two elements
  var sumPairs = [];
  // Generate all unique pairs (including self-pairs) and their sums
  for (var outerIdx = 0; outerIdx < valueList.length; outerIdx++) {
    for (var innerIdx = outerIdx; innerIdx < valueList.length; innerIdx++) {
      // If the sum exceeds the limit, skip this pair
      if (valueList[outerIdx] + valueList[innerIdx] > limitVal) {
        continue;
      }
      // Otherwise, add the sum to our list of valid sums
      sumPairs.push(valueList[outerIdx] + valueList[innerIdx]);
    }
  }

  // Sort the list of valid sums in ascending order
  sumPairs.sort(function(valA, valB) {
    return valA - valB;
  });

  // Initialize the variable to store the greatest sum found
  var greatestSum = 0;
  // Initialize a right pointer for the two-pointer approach
  var rightPtr = sumPairs.length - 1;

  // Use a two-pointer technique to find the maximum sum of two elements from sumPairs
  // such that their sum does not exceed limitVal
  for (var currentIdx = 0; currentIdx < sumPairs.length; currentIdx++) {
    // Move the right pointer inwards as long as the current sum exceeds the limit
    while (sumPairs[currentIdx] + sumPairs[rightPtr] > limitVal) {
      rightPtr--;
    }
    // Update the greatest sum if the current pair's sum is larger
    greatestSum = Math.max(greatestSum, sumPairs[currentIdx] + sumPairs[rightPtr]);
  }

  // Output the calculated greatest sum for the current test case
  console.log(greatestSum);
}
