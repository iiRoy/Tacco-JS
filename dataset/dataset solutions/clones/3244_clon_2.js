function processInput(rawData) {
  // Split the raw input string into an array of lines
  const inputLines = rawData.split('\n');

  // Parse the first line to get the number of elements
  const itemCount = Number.parseInt(inputLines[0], 10);

  // Initialize two arrays to store the parsed integer pairs
  const primaryValues = [];
  const secondaryValues = [];

  // Loop through the remaining lines to populate the arrays
  for (let loopCounter = 1; loopCounter <= itemCount; loopCounter++) {
    // Split each line by space and parse the two numbers
    const parts = inputLines[loopCounter].split(' ');
    primaryValues[loopCounter - 1] = Number.parseInt(parts[0], 10);
    secondaryValues[loopCounter - 1] = Number.parseInt(parts[1], 10);
  }

  // Perform the main calculation using the populated arrays and item count
  const finalCalculation = calculateResult(primaryValues, secondaryValues, itemCount);

  // Output the final computed value to the console
  console.log(finalCalculation);
}

/**
 * Performs a series of operations on two arrays based on an alternating pattern.
 * @param {number[]} arrOne - The first array of numbers.
 * @param {number[]} arrTwo - The second array of numbers.
 * @param {number} totalElements - The total number of elements to process.
 * @returns {number} The accumulated result of the operations.
 */
function calculateResult(arrOne, arrTwo, totalElements) {
  // Initialize an accumulator variable. Note: it starts as undefined,
  // which will result in NaN if the first operation is an addition/subtraction.
  let currentSum;

  // Iterate for the total number of elements
  for (let iterationIndex = 0; iterationIndex < totalElements; iterationIndex++) {
    let selectedIdx; // Variable to hold the index chosen in each step

    // Check if the current iteration index is even or odd
    if (iterationIndex % 2 === 0) {
      // If even, determine the best index using arrOne as primary and arrTwo as auxiliary
      selectedIdx = determineBestIndex(arrOne, arrTwo);
      // Add the value from arrOne at the selected index to the accumulator
      currentSum += arrOne[selectedIdx];
    } else {
      // If odd, determine the best index using arrTwo as primary and arrOne as auxiliary
      selectedIdx = determineBestIndex(arrTwo, arrOne);
      // Subtract the value from arrTwo at the selected index from the accumulator
      currentSum -= arrTwo[selectedIdx];
    }

    // Remove the chosen element from both arrays to prevent re-selection
    arrOne.splice(selectedIdx, 1);
    arrTwo.splice(selectedIdx, 1);
  }

  // Return the final accumulated sum
  return currentSum;
}

/**
 * Finds the index of the maximum value in the main array,
 * with a tie-breaking rule based on the auxiliary array.
 * @param {number[]} mainArr - The array to find the maximum value in.
 * @param {number[]} auxArr - The auxiliary array used for tie-breaking.
 * @returns {number} The index of the chosen element.
 */
function determineBestIndex(mainArr, auxArr) {
  let bestCandidateIdx = 0; // Initialize the best index to the first element
  // Find the maximum value in the main array using the spread operator
  const maximumValue = Math.max(...mainArr);

  // Iterate through the main array to find the optimal index
  // The loop condition `arrayPosition <= mainArr.length` is intentional
  // to match the original's behavior, which includes an out-of-bounds check
  // that will fail the `maximumValue === mainArr[arrayPosition]` condition.
  for (let arrayPosition = 0; arrayPosition <= mainArr.length; arrayPosition++) {
    // Check if the current element is the maximum value AND
    // if it's not the already chosen best index (to handle duplicates) AND
    // if the auxiliary array value at the current position is greater than or equal
    // to the auxiliary array value at the current best index (tie-breaker)
    if (maximumValue === mainArr[arrayPosition] &&
        bestCandidateIdx !== arrayPosition &&
        auxArr[bestCandidateIdx] <= auxArr[arrayPosition]) {
      // If all conditions met, update the best candidate index
      bestCandidateIdx = arrayPosition;
    }
  }
  // Return the determined optimal index
  return bestCandidateIdx;
}

// Read input from standard input and pass it to the main processing function
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
