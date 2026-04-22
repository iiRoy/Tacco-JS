function ProcessInput(rawData) {
  // First, the incoming raw text data is split into individual lines.
  // Each line is then further split by spaces, resulting in a 2D array of string components.
  const processedLines = rawData.split('\n').map(lineSegment => lineSegment.split(' '));

  // From the very first element of the first processed line,
  // we extract and convert it to a numeric value. This number will be
  // used as the divisor in our subsequent calculations.
  const targetDivisor = Number(processedLines[0][0]);

  // We initiate an indefinite loop to search for a specific sequence.
  // The goal is to find the smallest positive integer 'currentNumber'
  // such that the sum of integers from 1 up to 'currentNumber'
  // is perfectly divisible by 'targetDivisor'.
  for (let currentNumber = 1; true; currentNumber++) {
    // Calculate the sum of the first 'currentNumber' positive integers.
    // This is also known as the 'currentNumber'-th triangular number.
    // The formula for the k-th triangular number is T_k = k * (k + 1) / 2.
    const currentTriangularSum = (currentNumber * (currentNumber + 1)) / 2;

    // Check if the calculated triangular sum leaves no remainder when
    // divided by our predetermined 'targetDivisor'.
    if ((currentTriangularSum % targetDivisor) === 0) {
      // If the condition is met, we have found the desired 'currentNumber'.
      // This value is then printed to the console.
      console.log(currentNumber);
      // As we are looking for the *smallest* such number, we can
      // immediately exit the loop once it's found.
      break;
    }
  }
}

// This section handles the initial data acquisition for the program.
// It reads the entire content of the standard input stream (typically from /dev/stdin)
// as a UTF-8 encoded string and passes it to our primary processing function.
ProcessInput(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);