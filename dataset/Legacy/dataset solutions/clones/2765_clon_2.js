const processInputData = (inputLines) => {
  // Define the constant divisor for modulo operations.
  const moduloDivisor = 2019;

  // Parse the left and right bounds from the first line of input.
  // The `-0` converts the string parts to numbers.
  let leftBound = inputLines[0].split(" ")[0] - 0;
  let rightBound = inputLines[0].split(" ")[1] - 0;

  // These variables are declared but not used in the original logic,
  // but we preserve their declaration for structural similarity.
  let leftRemainder = leftBound % moduloDivisor;
  let rightRemainder = rightBound % moduloDivisor;

  // Initialize an array to store the remainders.
  const remainderValues = [];

  // Iterate through the numbers from the left bound to the right bound (inclusive).
  for (let currentNumber = leftBound; currentNumber <= rightBound; currentNumber++) {
    // Calculate the remainder when the current number is divided by the divisor.
    let currentRemainder = currentNumber % 2019;

    // Add the calculated remainder to our collection.
    remainderValues.push(currentRemainder);

    // If a remainder of 0 is found, it means a multiple of 2019 is in the range.
    // In this case, the minimum product will involve 0, so we can stop early.
    if (currentRemainder === 0) {
      break;
    }
  }

  // Sort the collected remainder values in ascending order.
  remainderValues.sort((firstVal, secondVal) => firstVal - secondVal);

  // Output the product of the two smallest remainder values.
  // If 0 was found, it will be remainderValues[0], making the product 0.
  console.log(remainderValues[0] * remainderValues[1]);
};

// Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
