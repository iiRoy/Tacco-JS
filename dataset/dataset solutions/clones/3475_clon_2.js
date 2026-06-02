// A utility function to convert a string representation into an integer value.
function parseInteger(inputString) {
  return parseInt(inputString);
}

/*
 * This function calculates the cumulative sum of absolute differences
 * between consecutive elements within a provided array of numbers.
 */
function calculateAbsoluteDifferenceSum(numberArray) {
  let totalDifference = 0; // Initialize a variable to accumulate the differences.
  // Iterate through the array from the first element up to, but not including, the last.
  for (let idx = 0; idx < numberArray.length - 1; idx++) {
    // Add the absolute difference between the current element and the next one.
    totalDifference += Math.abs(numberArray[idx] - numberArray[idx + 1]);
  }
  return totalDifference; // Return the final sum of absolute differences.
}

/**
 * Generates a numerical sequence by strategically selecting elements from a source array.
 * The selection process alternates between two strategies ('min' and 'max') to build
 * a sequence of a specified target length.
 *
 * @param {string} currentStrategy - The initial strategy to use ('min' to take from start, 'max' to take from end).
 * @param {Array<number>} sourceNumbers - The array from which numbers are drawn. This array will be modified.
 * @param {number} targetLength - The desired final length of the constructed sequence.
 * @returns {Array<number>} The newly formed sequence of numbers.
 */
function constructSequence(currentStrategy, sourceNumbers, targetLength) {
  const finalSequence = []; // This array will store the elements of the constructed sequence.

  // Continue adding elements until the sequence reaches the desired length.
  while (finalSequence.length < targetLength) {
    if (currentStrategy === 'min') {
      // If the sequence is currently empty, simply add the first available number.
      if (finalSequence.length === 0) {
        finalSequence.push(sourceNumbers.shift()); // Take from the beginning of sourceNumbers.
      } else {
        // Determine where to place the next number (from the start of sourceNumbers)
        // to minimize the difference with either end of the finalSequence.
        const candidateValue = sourceNumbers[0];
        const diffToFront = Math.abs(finalSequence[0] - candidateValue);
        const diffToBack = Math.abs(finalSequence[finalSequence.length - 1] - candidateValue);

        if (diffToFront > diffToBack) {
          // If placing at the front creates a larger difference, add to the front.
          finalSequence.unshift(sourceNumbers.shift());
          // If the sequence is not yet complete, take another element and add it to the other end.
          if (finalSequence.length !== targetLength) {
            finalSequence.push(sourceNumbers.shift());
          }
        } else {
          // Otherwise, add to the back of the sequence.
          finalSequence.push(sourceNumbers.shift());
          // If the sequence is not yet complete, take another element and add it to the other end.
          if (finalSequence.length !== targetLength) {
            finalSequence.unshift(sourceNumbers.shift());
          }
        }
      }
      // Switch the strategy for the next iteration.
      currentStrategy = 'max';
    } else { // The current strategy is 'max'.
      // If the sequence is currently empty, simply add the last available number.
      if (finalSequence.length === 0) {
        finalSequence.push(sourceNumbers.pop()); // Take from the end of sourceNumbers.
      } else {
        // Determine where to place the next number (from the end of sourceNumbers)
        // to minimize the difference with either end of the finalSequence.
        const candidateValue = sourceNumbers[sourceNumbers.length - 1];
        const diffToFront = Math.abs(finalSequence[0] - candidateValue);
        const diffToBack = Math.abs(finalSequence[finalSequence.length - 1] - candidateValue);

        if (diffToFront > diffToBack) {
          // If placing at the front creates a larger difference, add to the front.
          finalSequence.unshift(sourceNumbers.pop());
          // If the sequence is not yet complete, take another element and add it to the other end.
          if (finalSequence.length !== targetLength) {
            finalSequence.push(sourceNumbers.pop());
          }
        } else {
          // Otherwise, add to the back of the sequence.
          finalSequence.push(sourceNumbers.pop());
          // If the sequence is not yet complete, take another element and add it to the other end.
          if (finalSequence.length !== targetLength) {
            finalSequence.unshift(sourceNumbers.pop());
          }
        }
      }
      // Switch the strategy for the next iteration.
      currentStrategy = 'min';
    }
  }
  return finalSequence; // Return the fully constructed sequence.
}

// The primary function that processes the entire input.
function ProcessInput(rawData) {
  // Split the raw input string by newline characters and convert each part to an integer.
  const parsedValues = rawData.split("\n").map(parseInteger);
  const countElements = parsedValues[0]; // The first number in the input is the count of elements.
  const initialNumbers = []; // An array to store the actual numbers for processing.

  // Populate the initialNumbers array, skipping the first element which is the count.
  for (let loopIndex = 0; loopIndex < countElements; loopIndex++) {
    initialNumbers.push(parsedValues[loopIndex + 1]);
  }
  // Sort the numbers in ascending order, which is crucial for the bucket logic.
  initialNumbers.sort((a, b) => a - b);

  // Calculate the sum of differences using the 'min' strategy first.
  // A shallow copy of initialNumbers is passed to prevent modification of the original array.
  const resultOne = calculateAbsoluteDifferenceSum(
    constructSequence('min', [].concat(initialNumbers), countElements)
  );

  // Calculate the sum of differences using the 'max' strategy.
  // Another shallow copy is used for the second calculation.
  const resultTwo = calculateAbsoluteDifferenceSum(
    constructSequence('max', [].concat(initialNumbers), countElements)
  );

  // Output the larger of the two calculated sums of differences.
  if (resultOne > resultTwo) {
    console.log(resultOne);
  } else {
    console.log(resultTwo);
  }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
