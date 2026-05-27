function calculateGreatestCommonDivisor(numberArray) {
  // This nested function computes the greatest common divisor of two integers
  // using the Euclidean algorithm.
  const findDivisor = (val1, val2) => {
    return val2 ? findDivisor(val2, val1 % val2) : val1;
  };

  let currentGcd = numberArray[0]; // Initialize the GCD with the first element of the array
  // Iterate through the remaining elements to find the GCD of the entire array
  for (let idx = 1; idx < numberArray.length; idx++) {
    currentGcd = findDivisor(currentGcd, numberArray[idx]);
  }
  return currentGcd; // Return the final computed GCD
}

function ProcessInput(rawData) {
  let finalSum = 0; // Variable to accumulate the sum of GCDs
  const limitValue = parseInt(rawData); // Convert the input string to an integer once

  // First loop for the 'a' variable, from 1 up to the parsed input value
  for (let firstNum = 1; firstNum < limitValue + 1; firstNum++) {
    // Second loop for the 'b' variable, also from 1 up to the parsed input value
    for (let secondNum = 1; secondNum < limitValue + 1; secondNum++) {
      // Third loop for the 'c' variable, from 1 up to the parsed input value
      for (let thirdNum = 1; thirdNum < limitValue + 1; thirdNum++) {
        // Calculate the GCD for the current triplet [a, b, c] and add it to the total sum
        finalSum += calculateGreatestCommonDivisor([firstNum, secondNum, thirdNum]);
      }
    }
  }
  // Output the accumulated sum to the console
  console.log(finalSum);
}

// This section handles reading input and invoking the primary processing function.
// It should remain unchanged to ensure proper execution in the given environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
