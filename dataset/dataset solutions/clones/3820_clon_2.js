function ProcessInput(inputString) {
  // This function processes a multi-line string input to calculate a specific sum.
  // First, the input string is split into individual lines, and each line is converted to a number.
  let numericData = inputString.split("\n").map(currentValue => +currentValue);

  // The initial element of the processed array determines the upper bound for a subsequent loop.
  const countElements = numericData[0];

  // A variable is initialized to accumulate the final result of the calculation.
  let totalSum = 0;

  // A reverse loop iterates from the 'countElements' value down to 2 (exclusive).
  // This iteration pattern is crucial for the algorithm's logic.
  for (let loopIndex = countElements; loopIndex > 1; loopIndex--) {
    // A critical check: if the value at the current index is greater than or equal to the index itself,
    // it indicates an invalid state, and the program should output -1 and terminate.
    if (numericData[loopIndex] >= loopIndex) {
      console.log(-1); // Output the specific error code.
      return;          // Exit the function immediately.
    }

    // Conditional logic based on the relationship between the current element and its predecessor.
    // If the current element is exactly one greater than the element at the previous index...
    if (numericData[loopIndex] === numericData[loopIndex - 1] + 1) {
      // ...the accumulated sum is incremented by one.
      totalSum++;
    } else {
      // Otherwise, the value of the current element is added directly to the accumulated sum.
      totalSum += numericData[loopIndex];
    }
  }

  // After the loop has completed its iterations, the final calculated sum is printed to the console.
  console.log(totalSum);
}

// The program initiates by reading data from standard input.
// It uses Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin'
// and decodes it as a UTF-8 string before passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
