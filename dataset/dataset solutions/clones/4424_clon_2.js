// This function processes raw string input to calculate LCM or return the first element.
// It expects a string where numbers are separated by newlines.
function ProcessInputData(rawDataString) {
  // Parse the input string into an array of numbers.
  // Filter out any empty strings that might result from splitting.
  // Convert each string part to a numerical value.
  var numericValues = rawDataString.split("\n").filter(function(item) {
    return item;
  }).map(function(item) {
    return +item;
  });

  // The very first number in the input determines a special condition.
  var firstNumber = numericValues.shift();

  // Sort the remaining numbers in descending order for subsequent operations.
  var descendingNumbers = numericValues.sort(function(valA, valB) {
    return Number(valB) - Number(valA);
  });

  // If the initial number was 1, simply return the largest number from the sorted list.
  if (firstNumber === 1) {
    return descendingNumbers[0];
  }

  // Otherwise, calculate the Least Common Multiple (LCM) of all remaining numbers.
  // The LCM of two numbers (a, b) is computed as (a * b) / GCD(a, b).
  return descendingNumbers.reduce(function(accumulator, currentNum) {
    var greatestCommonDivisor = findGCD(accumulator, currentNum);
    return (accumulator * currentNum) / greatestCommonDivisor;
  });

  // Helper function to compute the Greatest Common Divisor (GCD) using the Euclidean algorithm.
  function findGCD(paramX, paramY) {
    if (paramY === 0) {
      return paramX;
    } else {
      return findGCD(paramY, paramX % paramY);
    }
  }
}

// Read input from standard input, process it, and print the final result to the console.
console.log(ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
