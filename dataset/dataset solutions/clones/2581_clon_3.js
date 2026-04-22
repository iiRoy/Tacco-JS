// Utility function to compute the combined absolute magnitude of a sequence of up to three elements.
function calculateSegmentMagnitude(startIndex, valueSegments) {
  // Validate the starting index to prevent out-of-bounds access.
  if (startIndex < 0 || startIndex >= valueSegments.length) {
    return 0; // Return zero for an invalid starting point to avoid errors.
  }

  let currentMagnitude = 0;
  // Iterate through elements from the startIndex, summing the absolute values of up to three consecutive items.
  for (let offset = 0; offset < 3; offset++) {
    const currentPosition = startIndex + offset;
    // Only add if the current position is within the array bounds.
    if (currentPosition < valueSegments.length) {
      currentMagnitude += Math.abs(valueSegments[currentPosition]);
    } else {
      // Stop iteration if there are no more elements to sum.
      break;
    }
  }
  return currentMagnitude;
}

// Function to determine the overall "satisfaction" score from a collection of numerical components.
function deriveFinalScore(scoreComponents) {
  // If the input array is empty or null, the score is zero.
  if (!scoreComponents || scoreComponents.length === 0) {
    return 0;
  }

  let totalSum = 0;
  // Accumulate the sum of all numerical components using a modern loop construct.
  for (const componentValue of scoreComponents) {
    totalSum += componentValue;
  }

  // Adjust the total sum by subtracting the total count of components,
  // representing a 'cost' associated with each component.
  return totalSum - scoreComponents.length;
}

// The primary routine for processing input and calculating the final outcome based on specific rules.
function processInputData(rawData) {
  // Divide the entire raw input string into an array of individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to extract the initial problem parameters.
  const firstLineParts = inputLines[0].split(" ");
  // Convert the string-based parameters to numeric values using the unary plus operator.
  const initialLength = +firstLineParts[0]; // Represents the 'N' value from the problem statement.
  const operationCount = +firstLineParts[1]; // Represents the 'K' value, indicating iterations.

  // Extract the main sequence string from the second line of input.
  const inputSequence = inputLines[1].split(" ")[0]; // Represents the 'S' string.

  // Implement a guard clause for an empty input sequence.
  if (!inputSequence || inputSequence.length === 0) {
    console.log(0); // Output 0 if there's no sequence to process.
    return;
  }

  // Convert the input sequence string into an array of numerical "component blocks".
  // This process identifies consecutive runs of identical characters and stores their lengths.
  const componentBlocks = [];
  let currentBlockSize = 0;
  let previousChar = ''; // A helper variable to keep track of the character from the previous iteration.

  // Loop through each character of the input sequence.
  for (let charIndex = 0; charIndex < initialLength; charIndex++) {
    const currentChar = inputSequence[charIndex]; // Access character using bracket notation.

    // Check if this is the very first character or if the character has changed from the previous one.
    if (charIndex === 0 || currentChar !== previousChar) {
      // If a block has just completed (i.e., currentBlockSize > 0), store its size.
      if (currentBlockSize > 0) {
        componentBlocks.push(currentBlockSize);
      }
      // Start a new block count.
      currentBlockSize = 1;
    } else {
      // Continue counting for the current block if the character is the same.
      currentBlockSize++;
    }
    // Update previousChar for the next iteration.
    previousChar = currentChar;
  }
  // After the loop, ensure that the last accumulated block size is added to the array.
  if (currentBlockSize > 0) {
    componentBlocks.push(currentBlockSize);
  }

  let finalResult = 0; // Initialize the variable to hold the final computed answer.

  // Apply a simplified calculation if the number of component blocks is small (2 or less).
  if (componentBlocks.length <= 2) {
    // In this specific scenario, the outcome is one less than the initial total length.
    finalResult = initialLength - 1;
  } else {
    // Execute an iterative optimization process for a specified number of operations.
    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
      let maxMagnitude = 0; // Tracks the highest segment magnitude discovered in this iteration.
      let maxPosIndex = -1; // Stores the starting index in `componentBlocks` where `maxMagnitude` was found.

      // Iterate through the `componentBlocks` array to identify the segment (1-3 elements)
      // that yields the maximum absolute sum.
      // This loop correctly passes the current index to the magnitude calculation function.
      for (let searchIdx = 0; searchIdx < componentBlocks.length; searchIdx++) {
        const currentSegmentMag = calculateSegmentMagnitude(searchIdx, componentBlocks);

        // If a larger magnitude is found, update the maximum and its corresponding index.
        if (currentSegmentMag > maxMagnitude) {
          maxMagnitude = currentSegmentMag;
          maxPosIndex = searchIdx;
        }
      }

      // Reconstruct the `componentBlocks` array by replacing the identified segment with its maximum magnitude.
      // This is an alternative array manipulation technique (Type III change) to `splice`.
      const leadingSegments = componentBlocks.slice(0, maxPosIndex);
      // Determine the end index for the segment to be skipped/replaced.
      const trailingSegmentStartIndex = Math.min(maxPosIndex + 3, componentBlocks.length);
      const trailingSegments = componentBlocks.slice(trailingSegmentStartIndex);

      // Rebuild the `componentBlocks` array in place.
      componentBlocks.length = 0; // Clear all existing elements.
      componentBlocks.push(...leadingSegments, maxMagnitude, ...trailingSegments); // Add new elements.

      // Check if the current "satisfaction" score has reached the maximum possible value.
      // If it has, further operations are redundant, so terminate the loop early.
      if (deriveFinalScore(componentBlocks) === initialLength - 1) {
        break;
      }
    }
    // After all operations (or an early termination), calculate the final "satisfaction" score.
    finalResult = deriveFinalScore(componentBlocks);
  }

  // Output the final computed result to the standard console.
  console.log(finalResult);
}

// Initiate the processing by reading input from the standard input stream.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));