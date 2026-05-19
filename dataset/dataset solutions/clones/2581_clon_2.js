// Function to calculate the absolute sum of elements in a specific range
function CalculateAbsoluteSum(idx, dataArray) {
  let totalValue = 0; // Initialize accumulator for sum
  totalValue = Math.abs(dataArray[idx]); // Add absolute value of current element

  // Check if the next element exists and add its absolute value
  if (idx + 1 < dataArray.length) {
    totalValue += Math.abs(dataArray[idx + 1]);
  }

  // Check if the element after the next exists and add its absolute value
  if (idx + 2 < dataArray.length) {
    totalValue += Math.abs(dataArray[idx + 2]);
  }

  return totalValue; // Return the computed sum
}

// Function to compute a "happiness score" from an array
function ComputeHappinessScore(valueList) {
  // Sum all elements in the list
  let currentScore = valueList.reduce(function(accumulator, currentElement) {
    return accumulator + currentElement;
  });

  // Subtract the number of elements from the sum
  currentScore -= valueList.length;
  return currentScore; // Return the final happiness score
}

// Main function to process the input data
function ProcessInputData(rawData) {
  // Split the raw input into lines
  rawData = rawData.split("\n");

  // Parse the first line for N and K
  let parsedLines = rawData[0].split(" ");
  const totalElements = Number.parseInt(parsedLines[0]); // N
  const operationCount = Number.parseInt(parsedLines[1]); // K

  // Parse the second line for the string S
  parsedLines = rawData[1].split(" ");
  const inputString = parsedLines[0]; // S

  // Convert the input string into an array of segment lengths
  // 'L' segments are positive, 'R' segments are negative (conceptually, but here just lengths)
  let segmentLengths = [];
  let lastChar = inputString.substr(0, 1); // Get the first character
  let currentLength = 1; // Initialize length of the first segment

  // Iterate through the string to find segment boundaries
  for (let charIndex = 1; charIndex < totalElements; charIndex++) {
    // If the current character is different from the previous one, a new segment starts
    if (inputString.substr(charIndex, 1) !== inputString.substr(charIndex - 1, 1)) {
      // The original code had a commented out section for 'R' segments,
      // which is not active and thus not included in the Type II clone's logic.
      // if (inputString.substr(charIndex - 1, 1) === 'R') {
      //   currentLength *= -1;
      // }
      segmentLengths.push(currentLength); // Store the length of the completed segment
      currentLength = 0; // Reset length for the new segment
    }
    currentLength += 1; // Increment length for the current segment
  }

  // After the loop, add the length of the last segment if it's not zero
  if (currentLength !== 0) {
    segmentLengths.push(currentLength);
  }

  // Core processing logic
  let finalResult = 0; // Initialize the final answer

  // Handle edge case where there are 2 or fewer segments
  if (segmentLengths.length <= 2) {
    finalResult = totalElements - 1; // Simple calculation for small segment counts
  } else {
    // Perform cumulative sum operations for K iterations
    for (let iterationNum = 0; iterationNum < operationCount; iterationNum++) {
      let maxSegmentSum = CalculateAbsoluteSum(0, segmentLengths); // Initial max sum from first segment
      let maxSegmentIndex = 0; // Index corresponding to the max sum

      // Iterate through segments to find the maximum sum of three consecutive absolute values
      for (let segmentIndex = 1; segmentIndex < segmentLengths.length; segmentIndex++) {
        let currentSegmentSum = CalculateAbsoluteSum(segmentIndex, segmentLengths); // Calculate sum for current position
        if (maxSegmentSum < currentSegmentSum) {
          maxSegmentSum = currentSegmentSum; // Update max sum
          maxSegmentIndex = segmentIndex; // Update index of max sum
        }
      }

      // Replace three segments with their combined sum at the found position
      segmentLengths.splice(maxSegmentIndex, 3, maxSegmentSum);

      // Check if the happiness score has reached its maximum possible value
      if (totalElements - 1 === ComputeHappinessScore(segmentLengths)) {
        break; // Exit loop if maximum happiness is achieved
      }
    }
    // Calculate the final happiness score after all operations
    finalResult = ComputeHappinessScore(segmentLengths);
  }

  // Output the final result to the console
  console.log(finalResult);
}

// Read input from standard input and pass it to the main function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
