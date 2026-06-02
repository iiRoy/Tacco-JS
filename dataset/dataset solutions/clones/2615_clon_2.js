function calculateDivisorCount(firstNumber, secondNumber) {
  // This nested function recursively checks for divisors based on specific criteria.
  function recursiveDivisorCheck(currentDivisor) {
    // If the current divisor exceeds 9, it's out of the valid range.
    if (currentDivisor > 9) {
      return 0;
    }
    // If the square of the current divisor is greater than the first number,
    // further divisors will also be too large.
    if (currentDivisor * currentDivisor > firstNumber) {
      return 0;
    }
    // Check if currentDivisor is a valid divisor and satisfies additional conditions.
    if (firstNumber % currentDivisor === 0 && firstNumber / currentDivisor < 10 && currentDivisor * 10 + firstNumber / currentDivisor <= secondNumber) {
      // Recursively call for the next divisor and add a count based on a secondary condition.
      return recursiveDivisorCheck(currentDivisor + 1) + (firstNumber / currentDivisor * 10 + currentDivisor <= secondNumber && firstNumber / currentDivisor !== currentDivisor ? 2 : 1);
    } else {
      // If the conditions are not met for the current divisor, proceed to the next one.
      return recursiveDivisorCheck(currentDivisor + 1);
    }
  }
  // The main logic for the outer function.
  if (firstNumber < 4) {
    return 0; // If the first number is less than 4, no valid divisors are considered.
  } else {
    // Start the recursive divisor check from 2 and add the result of calling
    // this function with a decremented first number.
    return recursiveDivisorCheck(2) + calculateDivisorCount(firstNumber - 1, secondNumber);
  }
}

function ProcessInput(rawData) {
  // Split the incoming string data by spaces to separate the two numbers.
  rawData = rawData.split(" ");
  // Parse the first part of the input string into an integer.
  let firstNumber = parseInt(rawData[0], 10);
  // Parse the second part of the input string into an integer.
  let secondNumber = parseInt(rawData[1], 10);
  // Output the calculated result to the console, formatted as a decimal integer.
  console.log('%d', calculateDivisorCount(firstNumber, secondNumber));
}

// The following line should not be modified (it handles reading from standard input and invoking the primary processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
