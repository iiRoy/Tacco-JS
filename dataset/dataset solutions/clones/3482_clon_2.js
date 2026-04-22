// This utility function computes the greatest common divisor of two integers.
function calculateGCD(inputA, inputB) {
  if (inputB === 0) {
    return inputA; // If the second number is zero, the GCD is the first number.
  }
  // Recursively apply the Euclidean algorithm.
  return calculateGCD(inputB, inputA % inputB);
}

/**
 * Generates an array of fractional positions based on a total length and number of segments.
 *
 * @param {number} segmentCount - The number of segments.
 * @param {number} totalSpan - The total length or span.
 * @returns {Array<number>} An array containing the calculated points.
 */
function createPositionArray(segmentCount, totalSpan) {
  let positionList = []; // Initialize an empty list to store positions.
  positionList.push(0); // Always start with a zero position.

  // Iterate from 1 up to (segmentCount - 1) to calculate intermediate points.
  for (let currentIdx = 1; currentIdx <= segmentCount - 1; currentIdx++) {
    positionList.push((currentIdx * totalSpan) / segmentCount); // Calculate and add the new point.
  }

  return positionList; // Return the array of computed positions.
}

// Main entry point for processing the input data.
function executeSolution(rawData) {
  // Split the raw input into individual lines.
  const inputLines = rawData.split('\n');

  // Parse the first line to get two numerical parameters.
  const numericParams = inputLines[0].split(' ');
  const firstValue = Number(numericParams[0]);
  const secondValue = Number(numericParams[1]);

  // Extract the two string patterns from the subsequent lines.
  const primaryString = inputLines[1];
  const secondaryString = inputLines[2];

  // Calculate the greatest common divisor of the two numerical parameters.
  const commonFactor = calculateGCD(firstValue, secondValue);

  // Initialize a variable to store the final outcome.
  let finalOutcome = -1; // Default to -1, indicating no solution or error.

  // Special case: If the two strings are identical, the answer is the first value.
  if (primaryString === secondaryString) {
    console.log(firstValue);
    return;
  }

  // Another special case: If one number is a multiple of the other, no solution possible.
  if (firstValue % secondValue === 0 || secondValue % firstValue === 0) {
    console.log(-1);
  } else {
    // This block handles the general case when a solution might exist.
    let currentIterationLength = 0; // Initialize loop variable.

    // Loop through potential common lengths, starting from LCM and incrementing by LCM.
    // The upper bound is arbitrary (10^5 in original), so let's keep it similar.
    for (
      currentIterationLength = (firstValue * secondValue) / commonFactor;
      currentIterationLength < Math.pow(10, 5);
      currentIterationLength += (firstValue * secondValue) / commonFactor
    ) {
      // Generate position arrays for both dimensions based on the current length.
      const firstPoints = createPositionArray(firstValue, currentIterationLength);
      const secondPoints = createPositionArray(secondValue, currentIterationLength);
      let isMatchConsistent = true; // Flag to check if characters align.

      // Iterate through all possible positions up to the current iteration length.
      for (let posIdx = 0; posIdx < currentIterationLength; posIdx++) {
        // Find the index of the current position in both point arrays.
        const charPositionA = firstPoints.indexOf(posIdx);
        const charPositionB = secondPoints.indexOf(posIdx);

        // If either position is not found, it means no character corresponds at this point, so skip.
        if (charPositionA < 0 || charPositionB < 0) {
          continue;
        }

        // If characters at corresponding positions do not match, set flag to false and break.
        if (primaryString[charPositionA] !== secondaryString[charPositionB]) {
          isMatchConsistent = false;
          break;
        }
      }

      // If all characters were consistent for this iteration length, we found our answer.
      if (isMatchConsistent) {
        break; // Exit the loop as the solution is found.
      }
    }
    // Output the found common iteration length.
    console.log(currentIterationLength);
  }
}

// Invoke the main solution function with content read from standard input.
executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));