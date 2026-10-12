function ProcessInput(rawData) {
  // Process the incoming raw data string.
  // First, split it by newline characters and convert each part to a number.
  let processedNumbers = rawData.split("\n").map(Number);

  // Remove the first element, as per the original logic.
  processedNumbers.shift();

  // Calculate the parity sum of the remaining numbers.
  const resultValue = calculateParitySum(processedNumbers);

  // Determine the output based on the parity of the result.
  if (resultValue % 2 === 1) {
    console.log("first"); // Output for odd parity.
  } else {
    console.log("second"); // Output for even parity.
  }
}

// Execute the main processing function with input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Computes a parity sum of an array of numbers.
 * The sum is kept modulo 2 to effectively track parity.
 * @param {Array<number>} dataArray - The array of numbers to sum.
 * @returns {number} The parity sum (0 or 1).
 */
function calculateParitySum(dataArray) {
  let currentTotal = 0; // Initialize the running total for parity.

  // Iterate through each element of the input array.
  for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
    currentTotal += dataArray[idx]; // Add the current array element to the total.

    // If the total reaches 2 or more, take it modulo 2 to keep it as a parity (0 or 1).
    if (currentTotal >= 2) {
      currentTotal %= 2;
    }
  }
  return currentTotal; // Return the final parity sum.
}
