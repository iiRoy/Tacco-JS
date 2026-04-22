// This function processes raw string input to find a specific minimum sum of digits.
function processInputData(rawData) {
  // Break down the entire input string into an array of lines.
  const textRows = rawData.split('\n');

  // Extract the first numerical value from the first row.
  // It's assumed the first line contains space-separated numbers, and we are interested in the initial one.
  const multiplierFactor = textRows.shift().split(' ').map(strVal => Number.parseInt(strVal))[0];

  // Initialize a variable to keep track of the smallest digit sum encountered.
  // It's set to a very high value initially so any calculated sum will be smaller.
  let minimumSum = Infinity;

  // Begin a primary loop that iterates a fixed number of times (100,000 iterations).
  for (let iterationCount = 1; iterationCount <= 100000; iterationCount++) {
    // Reset the accumulator for the sum of digits for the current product.
    let currentDigitSum = 0;

    // Compute the product of the pre-defined factor and the current loop count.
    // Convert this product into a string, then split it into an array of individual digit characters.
    // Finally, transform each character back into its integer representation.
    const digitArray = (multiplierFactor * iterationCount).toString().split('').map(strVal => Number.parseInt(strVal));

    // Iterate through each digit in the generated array to calculate their sum.
    for (let digitIndex = 0; digitIndex < digitArray.length; digitIndex++) {
      currentDigitSum += digitArray[digitIndex];
    }

    // Compare the current product's digit sum with the overall minimum sum found so far.
    // If the current sum is smaller, update the minimumSum variable.
    if (currentDigitSum < minimumSum) {
      minimumSum = currentDigitSum;
    }

    // This line resets the currentDigitSum to zero.
    // While structurally identical to the original, it's logically redundant here
    // because currentDigitSum is re-declared and re-initialized in the next loop iteration.
    currentDigitSum = 0;
  }

  // Output the final, smallest sum of digits found across all iterations to the standard console.
  console.log(minimumSum);
}

// Invoke the data processing function.
// It reads the complete content of the standard input stream ('/dev/stdin') as a UTF-8 string.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));