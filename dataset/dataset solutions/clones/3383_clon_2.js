function ProcessInput(rawData) {
  // Split the raw input string by newlines and convert each part to a number.
  let numericValues = rawData.split("\n").map(Number);

  // Remove the first element from the array, as per the problem's input format.
  numericValues.shift();

  // Calculate the sum of all numbers in the processed array.
  let resultIndicator = calculateTotal(numericValues);

  // If the sum of elements equals the count of elements, set the indicator to 1.
  // This implies all elements were 1.
  if (resultIndicator === numericValues.length) {
    resultIndicator = 1;
  }

  // Calculate a filtered sum (excluding 1s) and check its parity.
  // If the filtered sum is odd, force the indicator to 1.
  if (calculateFilteredSum(numericValues) % 2 === 1) {
    resultIndicator = 1;
  }

  // Determine the output based on the final parity of the result indicator.
  if (resultIndicator % 2 === 1) {
    console.log("first"); // Output "first" if odd.
  } else {
    console.log("second"); // Output "second" if even.
  }
}

// Execute the main processing function with input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Computes the sum of all numeric elements within an array.
 * @param {Array<number>} dataArray - The array of numbers to sum.
 * @returns {number} The total sum of the array elements.
 */
function calculateTotal(dataArray) {
  let totalSum = 0; // Initialize accumulator for the sum.
  // Iterate through each element of the array.
  for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
    totalSum += dataArray[idx]; // Add current element to the total.
  }
  return totalSum; // Return the final sum.
}

/**
 * Computes the sum of numeric elements in an array, excluding any values equal to 1.
 * @param {Array<number>} sourceArray - The array of numbers to sum selectively.
 * @returns {number} The sum of elements not equal to 1.
 */
function calculateFilteredSum(sourceArray) {
  let filteredTotal = 0; // Initialize accumulator for the filtered sum.
  // Loop through each item in the provided array.
  for (let indexCounter = 0, currentLength = sourceArray.length; indexCounter < currentLength; ++indexCounter) {
    // Only add to the sum if the current element is not 1.
    if (sourceArray[indexCounter] !== 1) {
      filteredTotal += sourceArray[indexCounter];
    }
  }
  return filteredTotal; // Return the sum of non-one elements.
}
