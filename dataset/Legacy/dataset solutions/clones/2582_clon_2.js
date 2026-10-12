function CalculateTripleSum(startIndex, valueArray) {
  let totalValue = 0; // Initialize a variable to hold the running total.
  totalValue = Math.abs(valueArray[startIndex]); // Add the absolute value of the element at the starting index.

  // Check if the next element exists in the array.
  if (startIndex + 1 < valueArray.length) {
    totalValue += Math.abs(valueArray[startIndex + 1]); // Include the absolute value of the subsequent element.
  }

  // Check if the element after the next one exists.
  if (startIndex + 2 < valueArray.length) {
    totalValue += Math.abs(valueArray[startIndex + 2]); // Add the absolute value of the element two positions ahead.
  }

  return totalValue; // Return the computed sum of absolute values.
}

function ProcessInputData(rawData) {
  // Split the raw input string into an array of lines.
  const lineSegments = rawData.split("\n");

  // Process the first line to extract numerical parameters.
  const firstLineParts = lineSegments[0].split(" ");
  const segmentCount = Number.parseInt(firstLineParts[0]); // N from original
  const operationLimit = Number.parseInt(firstLineParts[1]); // K from original

  // Process the second line to get the main input string.
  const secondLineParts = lineSegments[1].split(" ");
  const inputString = secondLineParts[0]; // S from original

  // This array will store the lengths of consecutive identical characters.
  const segmentLengths = []; // tmp from original

  // Keep track of the character from the previous position.
  let previousChar = inputString.substring(0, 1); // lst from original (though not strictly used as 'lst' in the loop)
  let currentLength = 1; // cnt from original, counts consecutive characters.

  // Iterate through the input string starting from the second character.
  for (let charIndex = 1; charIndex < segmentCount; charIndex++) {
    // If the current character is different from the previous one, a new segment begins.
    if (inputString.substring(charIndex, charIndex + 1) !== inputString.substring(charIndex - 1, charIndex)) {
      segmentLengths.push(currentLength); // Store the length of the completed segment.
      currentLength = 0; // Reset the counter for the new segment.
    }
    currentLength += 1; // Increment the counter for the current character.
  }

  // After the loop, add the length of the very last segment.
  if (currentLength !== 0) {
    segmentLengths.push(currentLength);
  }

  // Initialize the variable to store the final computed result.
  let finalResult = 0; // ans from original
  let unusedCounter = 0; // cnt from original, seems unused after initialization

  // Apply the main processing logic based on the number of segments.
  if (segmentLengths.length <= 2) {
    finalResult = segmentCount - 1; // If few segments, result is N-1.
  } else {
    // Perform operations for a specified number of times (K).
    for (let iterationIndex = 0; iterationIndex < operationLimit; iterationIndex++) {
      // Find the maximum sum of three consecutive absolute values.
      let maxCurrentSum = CalculateTripleSum(0, segmentLengths); // last from original
      let maxSumPosition = 0; // posi from original

      // Iterate through the segmentLengths array to find the optimal position for replacement.
      for (let checkIndex = 1; checkIndex < segmentLengths.length; checkIndex++) {
        // Calculate the sum for the current window.
        // NOTE: The original code uses SumAbs(1, tmp) here, which means it always calculates the sum starting from index 1,
        // regardless of `checkIndex`. This behavior is preserved as per Type II cloning rules.
        let currentWindowSum = CalculateTripleSum(1, segmentLengths); // now from original

        // If the current window sum is greater than the previously found maximum.
        if (maxCurrentSum < currentWindowSum) {
          maxCurrentSum = currentWindowSum; // Update the maximum sum.
          maxSumPosition = checkIndex; // Update the position where this maximum was found.
        }
      }

      // Replace three elements starting at maxSumPosition with the calculated maxCurrentSum.
      segmentLengths.splice(maxSumPosition, 3, maxCurrentSum);
    }

    // Calculate the final result by summing all elements in the modified segmentLengths array.
    finalResult = segmentLengths.reduce(function(accumulator, currentElement) {
      return accumulator + currentElement;
    });

    // Subtract the number of elements in the array from the sum.
    finalResult -= segmentLengths.length;
  }

  // Output the final computed result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
