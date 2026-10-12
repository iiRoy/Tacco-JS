function calculateLCM(firstNum, secondNum) {
  // This nested function computes the Greatest Common Divisor (GCD) of two numbers
  // using the Euclidean algorithm.
  let findGCD = (val1, val2) => {
    // If the second value is zero, the first value is the GCD.
    // Otherwise, recursively call with the second value and the remainder of the first divided by the second.
    return val2 ? findGCD(val2, val1 % val2) : val1;
  };

  // The Least Common Multiple (LCM) of two numbers is calculated as their product
  // divided by their Greatest Common Divisor (GCD).
  return (firstNum * secondNum) / findGCD(firstNum, secondNum);
}

// This is the main function responsible for processing the input.
function ProcessInput(rawData) {
  // First, remove any leading/trailing whitespace from the input string.
  // Then, split the string by spaces to get an array of string representations of numbers.
  // Finally, map each string representation to its integer equivalent.
  const numArray = rawData.trim().split(' ').map(strVal => parseInt(strVal, 10));

  // Calculate the LCM of the first two numbers obtained from the input array.
  const resultValue = calculateLCM(numArray[0], numArray[1]);

  // Print the computed LCM to the standard output.
  console.log(resultValue);
}

// Read the entire content from standard input as a UTF-8 string,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
