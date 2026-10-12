'use strict';

function processData(rawData) {
  // Split the incoming data into lines for processing.
  let parsedLines = rawData.split('\n');

  // Extract the number of elements from the first line.
  const numElements = ~~parsedLines[0];

  // Get the sequence of characters from the second line.
  const symbolString = parsedLines[1];

  // Initialize an array to store cumulative counts of 'E' characters.
  // The first element is 0, representing the count before any characters.
  const cumulativeCounts = [0];

  // Iterate through the character sequence to build the cumulative counts.
  for (let currentIdx = 0; currentIdx < numElements; currentIdx++) {
    if (symbolString[currentIdx] === 'E') {
      // If the current character is 'E', increment the count from the previous position.
      cumulativeCounts[currentIdx + 1] = cumulativeCounts[currentIdx] + 1;
    } else {
      // If it's not 'E' (assumed to be 'W'), the count remains the same as the previous position.
      cumulativeCounts[currentIdx + 1] = cumulativeCounts[currentIdx];
    }
  }

  // Initialize the variable to hold the smallest sum found,
  // setting it to the maximum possible safe integer initially.
  let smallestSum = Number.MAX_SAFE_INTEGER;

  // Iterate through all possible split points in the sequence.
  // A split point 'splitPoint' means the sequence is divided into
  // characters before 'splitPoint' and characters from 'splitPoint' onwards.
  for (let splitPoint = 1; splitPoint <= numElements; splitPoint++) {
    // Calculate the number of 'W' characters to the left of the split point.
    // Total characters to the left: (splitPoint - 1)
    // 'E' characters to the left: cumulativeCounts[splitPoint - 1]
    // So, 'W' characters to the left: (splitPoint - 1) - cumulativeCounts[splitPoint - 1]
    let leftWCount = (splitPoint - 1) - cumulativeCounts[splitPoint - 1];

    // Calculate the number of 'E' characters to the right of the split point.
    // Total 'E' characters in the whole string: cumulativeCounts[numElements]
    // 'E' characters to the left: cumulativeCounts[splitPoint - 1]
    // So, 'E' characters to the right: cumulativeCounts[numElements] - cumulativeCounts[splitPoint - 1]
    let rightECount = cumulativeCounts[numElements] - cumulativeCounts[splitPoint - 1];

    // The temporary result is the sum of 'W's on the left and 'E's on the right.
    let temporaryResult = leftWCount + rightECount;

    // Update the smallest sum if the current temporary result is smaller.
    smallestSum = (smallestSum > temporaryResult) ? temporaryResult : smallestSum;
  }

  // Output the final smallest sum.
  console.log(smallestSum);
}

// Read input from standard input and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
