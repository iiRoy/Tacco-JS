function ProcessInput(rawData) {
  // Split the raw input string into an array of lines, using newline as a delimiter.
  let linesOfData = rawData.split("\n");

  // Initialize an outer loop counter. This loop is designed to run indefinitely
  // until a specific break condition is met.
  for (let outerIndex = 0; true; outerIndex++) {
    // Parse the current line as an integer with base 10.
    // Also, initialize a counter for the current number's result.
    const currentNumber = parseInt(linesOfData[outerIndex], 10);
    let resultCount = 0;

    // If the parsed number is zero, it signifies the end of input,
    // so we exit the main processing loop.
    if (currentNumber === 0) {
      break;
    }

    // Begin an inner loop to iterate through possible values for 'j'.
    // The loop starts from 2 and goes up to (but not including) currentNumber.
    for (let innerIterator = 2; innerIterator < currentNumber; innerIterator++) {
      // Calculate a temporary value based on the current number and inner iterator.
      // This calculation is part of the core algorithm.
      const tempValue = currentNumber - (innerIterator * (innerIterator - 1)) / 2;

      // Check two conditions:
      // 1. The temporary value must be non-negative.
      // 2. The temporary value must be perfectly divisible by the inner iterator.
      // If both conditions are met, increment the result counter.
      if (tempValue >= 0 && tempValue % innerIterator === 0) {
        resultCount++;
      }
    }

    // Output the calculated result count for the current number to the console.
    console.log(resultCount);
  }
}

// Read the input from standard input using Node.js 'fs' module.
// The input is read synchronously and decoded as UTF-8.
// Then, the main processing function is called with this input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
