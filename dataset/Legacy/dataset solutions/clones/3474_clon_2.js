function parseIntegerVal(inputString) {
  // Converts a string representation to an integer.
  return parseInt(inputString);
}

function calculateAbsoluteDifferenceSum(numberArray) {
  let totalDifference = 0; // Accumulator for the sum of absolute differences.
  // Iterate through the array, comparing adjacent elements.
  for (let idx = 0; idx < numberArray.length - 1; idx++) {
    totalDifference += Math.abs(numberArray[idx] - numberArray[idx + 1]);
  }
  return totalDifference; // Returns the total calculated difference.
}

function ProcessInputData(rawData) {
  // Split the raw input string by newlines and convert each part to an integer.
  const parsedNumbers = rawData.split("\n").map(parseIntegerVal);

  // The first element of the parsed data represents the count of elements.
  const countOfElements = parsedNumbers[0];

  // Initialize a collection to hold the numbers for processing.
  const initialCollection = [];
  // Populate the collection with numbers from the input, skipping the first element (count).
  for (let loopIndex = 0; loopIndex < countOfElements; loopIndex++) {
    initialCollection.push(parsedNumbers[loopIndex + 1]);
  }

  // This array will store the final arrangement of numbers.
  const finalArrangement = [];
  // Sort the initial collection in ascending order.
  initialCollection.sort((a, b) => a - b);

  // Determine the strategy for placing numbers: 'min' or 'max'.
  let currentStrategy = 'min';

  // Continue arranging numbers until the final array has all elements.
  while (finalArrangement.length < countOfElements) {
    if (currentStrategy === 'min') {
      // If the final arrangement is empty, add the smallest available number.
      if (finalArrangement.length === 0) {
        finalArrangement.push(initialCollection.shift());
      } else {
        // Compare placing the smallest available number at the beginning or end.
        if (Math.abs(finalArrangement[0] - initialCollection[0]) > Math.abs(finalArrangement[finalArrangement.length - 1] - initialCollection[0])) {
          // If placing at the beginning is better, do so.
          finalArrangement.unshift(initialCollection.shift());
          // If there are still numbers to place, add the next smallest to the end.
          if (finalArrangement.length !== countOfElements) {
            finalArrangement.push(initialCollection.shift());
          }
        } else {
          // Otherwise, place the smallest at the end.
          finalArrangement.push(initialCollection.shift());
          // If there are still numbers to place, add the next smallest to the beginning.
          if (finalArrangement.length !== countOfElements) {
            finalArrangement.unshift(initialCollection.shift());
          }
        }
      }
      // Switch strategy to 'max' for the next iteration.
      currentStrategy = 'max';
    } else {
      // Strategy is 'max': compare placing the largest available number.
      if (Math.abs(finalArrangement[0] - initialCollection[initialCollection.length - 1]) > Math.abs(finalArrangement[finalArrangement.length - 1] - initialCollection[initialCollection.length - 1])) {
        // If placing the largest at the beginning is better, do so.
        finalArrangement.unshift(initialCollection.pop());
        // If there are still numbers to place, add the next largest to the end.
        if (finalArrangement.length !== countOfElements) {
          finalArrangement.push(initialCollection.pop());
        }
      } else {
        // Otherwise, place the largest at the end.
        finalArrangement.push(initialCollection.pop());
        // If there are still numbers to place, add the next largest to the beginning.
        if (finalArrangement.length !== countOfElements) {
          finalArrangement.unshift(initialCollection.pop());
        }
      }
      // Switch strategy to 'min' for the next iteration.
      currentStrategy = 'min';
    }
  }

  // Output the sum of absolute differences for the final arrangement.
  console.log(calculateAbsoluteDifferenceSum(finalArrangement));
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
