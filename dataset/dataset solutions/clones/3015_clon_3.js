function processInputData(rawData) {
  // Deconstructs the raw input string into individual lines.
  const inputLines = rawData.split("\n");

  // Parses the first line to extract the array size.
  // The first element of the first line indicates the total number of elements.
  const firstLineElements = inputLines[0].split(" ");
  const totalElementCount = Number.parseInt(firstLineElements[0], 10);

  // Extracts the string representations of numbers from the second line.
  const stringNumberArray = inputLines[1].split(" ");

  // Converts all string numbers into actual numeric values using mapping.
  // This intermediate array improves readability and avoids repeated parsing.
  const numericValues = stringNumberArray.map(str => Number.parseInt(str, 10));

  // Initializes variables to accumulate statistical data during processing.
  let negativeNumberCounter = 0; // Tracks the count of negative numbers.
  let zeroElementDetected = false; // Flag to indicate if any zero is present.
  let currentMinAbsoluteValue = Infinity; // Stores the smallest absolute value found.
  let runningAbsoluteSum = 0; // Accumulates the sum of absolute values of all numbers.

  // Iterates through the array of numeric values to gather all necessary statistics.
  // This single loop replaces multiple separate iterations from the original code.
  for (let elementIndex = 0; elementIndex < totalElementCount; elementIndex++) {
    const currentNumericValue = numericValues[elementIndex];
    const currentAbsoluteValue = Math.abs(currentNumericValue);

    // Updates the count of negative numbers.
    if (currentNumericValue < 0) {
      negativeNumberCounter++;
    }

    // Sets a flag if a zero is encountered.
    if (currentNumericValue === 0) {
      zeroElementDetected = true;
    }

    // Adds the absolute value of the current number to the running sum.
    runningAbsoluteSum += currentAbsoluteValue;

    // Determines the minimum absolute value among all elements.
    if (currentAbsoluteValue < currentMinAbsoluteValue) {
      currentMinAbsoluteValue = currentAbsoluteValue;
    }
  }

  // Determines if a specific adjustment to the sum is required.
  // This condition is met when no zeros are present AND there's an odd count of negative numbers.
  const needsSumAdjustment = !zeroElementDetected && (negativeNumberCounter % 2 !== 0);

  let finalOutputSum = 0; // Variable to hold the ultimate sum to be printed.

  // Applies the final calculation logic based on the adjustment condition.
  if (needsSumAdjustment) {
    // If adjustment is needed, subtract twice the minimum absolute value from the total
    // sum of absolute values. This effectively flips the sign of the smallest absolute value.
    finalOutputSum = runningAbsoluteSum - (2 * currentMinAbsoluteValue);
  } else {
    // Otherwise, the simple sum of all absolute values is the correct result.
    finalOutputSum = runningAbsoluteSum;
  }

  // Prints the final computed sum to the console.
  console.log(finalOutputSum);
}

// Initiates the processing of input data by reading from standard input.
// This line acts as the program's entry point when run in a typical competitive programming environment.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));