function logMessage(content) {
  console.log(content);
}

function ProcessInput(rawInputData) {
  // Convert the input string to an integer.
  let numericValue = parseInt(rawInputData, 10);

  // Handle the base case where the input is 1.
  if (numericValue === 1) {
    logMessage("1");
    return;
  }

  // Obtain a sorted list of all divisors for the given number.
  const divisorCollection = retrieveDivisorSet(numericValue);

  // Initialize the minimum digit count with a sufficiently large value.
  let minimumDigitCount = 20; // A reasonable upper bound for typical problem constraints.

  // Iterate through the first half of the divisor list to find pairs.
  for (let index = 0; index < divisorCollection.length / 2; index++) {
    const firstFactor = divisorCollection[index];
    const secondFactor = divisorCollection[divisorCollection.length - (index + 1)];

    // Calculate the maximum digit count for the current pair of factors.
    // Update the overall minimum if this pair yields a smaller maximum.
    minimumDigitCount = Math.min(minimumDigitCount, determineMaxDigits(firstFactor, secondFactor));
  }

  // Output the final minimum digit count.
  logMessage(minimumDigitCount);
}

// Calculates the maximum number of digits between two given numbers.
function determineMaxDigits(numberOne, numberTwo) {
  return Math.max(numberOne.toString().length, numberTwo.toString().length);
}

// Generates a sorted list of all positive divisors for a given integer.
// This implementation is optimized for performance.
function retrieveDivisorSet(targetInteger) {
  const divisors = [];
  // Iterate up to the square root of the target integer.
  for (let counter = 1; counter * counter <= targetInteger; counter++) {
    if (targetInteger % counter === 0) {
      // If 'counter' is a divisor, add it to the list.
      divisors.push(counter);
      // If 'counter' is not the square root, then 'targetInteger / counter' is also a divisor.
      if (counter * counter !== targetInteger) {
        divisors.push(targetInteger / counter);
      }
    }
  }
  // Sort the collected divisors in ascending order.
  divisors.sort((valA, valB) => valA - valB);
  return divisors;
}

// Read input from standard input, process it, and execute the main logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
