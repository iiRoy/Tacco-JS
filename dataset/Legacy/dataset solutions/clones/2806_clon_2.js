// This function processes the raw input string.
function ProcessInput(rawData) {
  // Split the input string by spaces to obtain individual number strings.
  let parsedValues = rawData.split(" ");

  // Convert the string values to numeric types using the unary plus operator.
  const startNum = +parsedValues[0]; // The first number defines the start of the range.
  const endNum = +parsedValues[1];   // The second number defines the end of the range.
  const divisorOne = +parsedValues[2]; // The third number is the first potential divisor.
  const divisorTwo = +parsedValues[3]; // The fourth number is the second potential divisor.

  // Initialize a counter for numbers within the range that are not divisible by either divisor.
  let nonDivisibleCount = 0;

  // Iterate through each integer from the starting number up to and including the ending number.
  for (let currentVal = startNum; currentVal <= endNum; currentVal++) {
    // Check if the current number is perfectly divisible by divisorOne OR divisorTwo.
    // The modulo operator (%) returns the remainder of a division.
    if (currentVal % divisorOne === 0 || currentVal % divisorTwo === 0) {
      // If the number is divisible by at least one of the divisors, we do nothing.
      // This block is intentionally left empty, mirroring the original logic.
    } else {
      // If the number is not divisible by either divisor, increment our counter.
      nonDivisibleCount++;
    }
  }

  // Print the final calculated count to the console.
  console.log(nonDivisibleCount);
}

// The following line is responsible for reading input from standard input and invoking the main processing function.
// It should remain unchanged as it handles external system interactions.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
